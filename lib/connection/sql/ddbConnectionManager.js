/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao DDBConnectionManager
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'DDBConnectionManager');
var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var utils = require('../../util/utils');
var BearcatHa = require('bearcat-ha');
var HASTATE = BearcatHa.HASTATE;
var mysql = require('mysql');
var Util = require('util');

/**
 * DDBConnectionManager constructor function.
 *
 * @api public
 */
var DDBConnectionManager = function() {
	this.poolMap = {};
	this.dbUrlMap = {};
	this.user = null; // mysql username
	this.password = null; // mysql password
	this.options = {};
	this.usePool = Constant.DEFAULT_MYSQL_USE_POOL;
	this.connectionCb = Constant.DEFAULT_MYSQL_CONNECT_CB;
	this.charset = null;
	this.zkChroot = null;
	this.zkServers = null;
	this.zkUsername = null;
	this.zkPassword = null;
	this.haClient = null;
}

Util.inherits(DDBConnectionManager, EventEmitter);

DDBConnectionManager.prototype.initHaClient = function(cb) {
	var opts = {
		chroot: this.zkChroot,
		servers: this.zkServers,
		username: this.zkUsername,
		password: this.zkPassword
	};

	var haClient = BearcatHa.createClient(opts);

	haClient.once('ready', function() {
		logger.info('this.haClient ready, state: %j', haClient.haState);
		cb && cb();
	});

	haClient.on('change', function(name, state) {
		logger.info('haClient %s state changed: %j', name, state);
	});

	haClient.on('nodeAdd', function(name, state) {
		logger.info('haClient %s state nodeAdd: %j', name, state);
	});

	haClient.on('nodeRemove', function(name, state) {
		logger.info('haClient %s state nodeRemove: %j', name, state);
	});

	haClient.on('masterChange', function(name, state) {
		logger.error('haClient %s master changed, state: %j', name, state);
	});

	haClient.on('error', function(err) {
		logger.error('haClient error ' + err.stack);
	});

	this.haClient = haClient;
}

/**
 * DDBConnectionManager get connection.
 *
 * @param  {Function} cb callback function
 * @api public
 */
DDBConnectionManager.prototype.getConnection = function(node, role, cb) {
	var self = this;
	this.fetchConnection(node, role, function(err, connection) {
		if (err) {
			return cb(err);
		}

		self.bindEvents(connection);

		cb(err, connection);
	});
}

/**
 * DDBConnectionManager release connection.
 *
 * @param  {Object} connection
 * @api public
 */
DDBConnectionManager.prototype.release = function(connection) {
	if (this.usePool) {
		connection.release();
	} else {
		connection.end();
	}
}

/**
 * DDBConnectionManager end connection.
 *
 * @param  {Object} connection
 * @api public
 */
DDBConnectionManager.prototype.end = function(connection) {
	connection.end();
}

/**
 * DDBConnectionManager destroy connection.
 *
 * @param  {Object} connection
 * @api public
 */
DDBConnectionManager.prototype.destroy = function(connection) {
	connection.destroy();
}

/**
 * DDBConnectionManager fetch connection.
 *
 * @param  {Function} cb callback function
 * @api public
 */
DDBConnectionManager.prototype.fetchConnection = function(node, role, cb) {
	if (!utils.checkFunction(cb)) {
		cb = this.connectionCb;
	}

	var self = this;
	if (!this.haClient) {
		this.initHaClient(function() {
			self.fetchConnection(node, role, cb);
		});
		return;
	}

	if (this.haClient) {
		var haStatus = this.haClient.state;
		if (haStatus < HASTATE.STATE_READY) {
			// when haClient zookeeper is initing or reconnecting
			if (haStatus != HASTATE.STATE_TIMEOUT) {
				// haState is not ready, just wait in event-loop to try again and again
				return setTimeout(function() {
					self.fetchConnection(node, role, cb);
				}, 1000);
			} else {
				// connect zookeeper timeout, no need to retry for the case that closure memory will leak
				return cb();
			}
		}
	}

	var targetDB = this.getTargetDB(node, role);
	var parsedTargetDB = this.parseTargetDB(targetDB);

	if (this.usePool) {
		if (!this.poolMap[targetDB]) {
			this.setPool(targetDB, this.createPool(parsedTargetDB));
		}
		this.poolMap[targetDB].getConnection(cb);
	} else {
		var connection = this.createConnection(parsedTargetDB);
		cb(null, connection);
	}
}

DDBConnectionManager.prototype.getTargetDB = function(node, role) {
	var targetNode = this.haClient.getClient(node, role);
	return targetNode;
}

DDBConnectionManager.prototype.parseTargetDB = function(targetDB) {
	var urlMap = this.dbUrlMap[targetDB];
	if (urlMap) {
		return urlMap;
	}

	urlMap = this.doParseTargetDB(targetDB);
	if (!urlMap) {
		return;
	}

	this.dbUrlMap[targetDB] = urlMap;
	return urlMap;
}

DDBConnectionManager.prototype.doParseTargetDB = function(targetDB) {
	var hosts = targetDB.split(":");
	if (hosts.length <= 1) {
		return;
	}

	var host = hosts[0];
	var left = hosts[1];

	var ports = left.split("/");
	if (ports.length <= 1) {
		return {
			host: host,
			port: left
		};
	}

	var port = ports[0];
	var database = ports[1];

	return {
		host: host,
		port: port,
		database: database
	}
}

DDBConnectionManager.prototype.bindEvents = function(connection) {

}

/**
 * DDBConnectionManager create connection pool.
 *
 * @api public
 */
DDBConnectionManager.prototype.createPool = function(dbOptions) {
	var options = this.getConnectionOptions();

	for (var key in dbOptions) {
		options[key] = dbOptions[key];
	}

	var pool = mysql.createPool(options);

	return pool;
}

/**
 * DDBConnectionManager create connection.
 *
 * @api public
 */
DDBConnectionManager.prototype.createConnection = function(dbOptions) {
	var options = this.getConnectionOptions();

	for (var key in dbOptions) {
		options[key] = dbOptions[key];
	}

	var connection = mysql.createConnection(options);

	return this.postProcessConnection(connection);
}

/**
 * DDBConnectionManager get connection options.
 *
 * @return  {Object} connection options
 * @api public
 */
DDBConnectionManager.prototype.getConnectionOptions = function() {
	var options = this.options || {};
	options['host'] = this.host;
	options['port'] = this.port;
	options['user'] = this.user;
	options['password'] = this.password;
	options['database'] = this.database;
	options['charset'] = this.charset;

	return options
}

/**
 * DDBConnectionManager post process connection.
 *
 * @param  {Object} connection
 * @api public
 */
DDBConnectionManager.prototype.postProcessConnection = function(connection) {
	return connection;
}

/**
 * DDBConnectionManager set user.
 *
 * @param  {String} user username
 * @api public
 */
DDBConnectionManager.prototype.setUser = function(user) {
	this.user = user;
}

/**
 * DDBConnectionManager get user.
 *
 * @return  {String} username
 * @api public
 */
DDBConnectionManager.prototype.getUser = function() {
	return this.user;
}

/**
 * DDBConnectionManager set password.
 *
 * @param  {String} password
 * @api public
 */
DDBConnectionManager.prototype.setPassword = function(password) {
	this.password = password;
}

/**
 * DDBConnectionManager get password.
 *
 * @return  {String} password
 * @api public
 */
DDBConnectionManager.prototype.getPassword = function() {
	return this.password;
}

/**
 * DDBConnectionManager set options.
 *
 * @param  {Object} options
 * @api public
 */
DDBConnectionManager.prototype.setOptions = function(options) {
	this.options = options;
}

/**
 * DDBConnectionManager get options.
 *
 * @return  {Object} options
 * @api public
 */
DDBConnectionManager.prototype.getOptions = function() {
	return this.options;
}

/**
 * DDBConnectionManager set usePool.
 *
 * @param  {Boolean} usePool
 * @api public
 */
DDBConnectionManager.prototype.setUsePool = function(usePool) {
	this.usePool = usePool;
}

/**
 * DDBConnectionManager get usePool.
 *
 * @return  {Boolean} usePool
 * @api public
 */
DDBConnectionManager.prototype.getUsePool = function() {
	return this.usePool;
}

/**
 * DDBConnectionManager set pool.
 *
 * @return  {Object} pool
 * @api public
 */
DDBConnectionManager.prototype.setPool = function(key, pool) {
	this.poolMap[key] = pool;
}

/**
 * DDBConnectionManager get pool.
 *
 * @return  {Object} pool
 * @api public
 */
DDBConnectionManager.prototype.getPool = function(key) {
	return this.poolMap;
}

module.exports = DDBConnectionManager;