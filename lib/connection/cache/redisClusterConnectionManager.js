/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao RedisClusterConnectionManager
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'RedisClusterConnectionManager');
var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var utils = require('../../util/utils');
var BearcatHa = require('bearcat-ha');
var HASTATE = BearcatHa.HASTATE;
var redis = require('redis');
var Util = require('util');

/**
 * RedisClusterConnectionManager constructor function.
 *
 * @api public
 */
var RedisClusterConnectionManager = function() {
	this.poolMap = {};
	this.dbUrlMap = {};
	this.password = null; // redis password
	this.retry_max_delay = Constant.REDIS_RETRY_MAX_DELAY;
	this.options = {};
	this.usePool = true;
	this.connectionCb = Constant.DEFAULT_REDIS_CONNECT_CB;
	this.zkChroot = null;
	this.zkServers = null;
	this.zkUsername = null;
	this.zkPassword = null;
	this.haClient = null;
}

Util.inherits(RedisClusterConnectionManager, EventEmitter);

RedisClusterConnectionManager.prototype.initHaClient = function(cb) {
	var opts = {
		chroot: this.zkChroot,
		servers: this.zkServers,
		username: this.zkUsername,
		password: this.zkPassword
	};

	var haClient = BearcatHa.createClient(opts);

	var self = this;
	haClient.on('ready', function() {
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
 * RedisClusterConnectionManager get connection.
 *
 * @param  {Function} cb callback function
 * @api public
 */
RedisClusterConnectionManager.prototype.getConnection = function(node, role, cb) {
	this.fetchConnection(node, role, function(err, connection) {
		if (err) {
			return cb(err);
		}

		cb(err, connection);
	});
}

RedisClusterConnectionManager.prototype.restartHaClient = function() {
	if (this.haClient) {
		this.haClient.restart();
	}
}

/**
 * RedisClusterConnectionManager release connection.
 *
 * @param  {Object} connection
 * @api public
 */
RedisClusterConnectionManager.prototype.release = function(connection) {
	connection.end();
}

/**
 * RedisClusterConnectionManager end connection.
 *
 * @param  {Object} connection
 * @api public
 */
RedisClusterConnectionManager.prototype.end = function(connection) {
	connection.end();
}

/**
 * RedisClusterConnectionManager destroy connection.
 *
 * @param  {Object} connection
 * @api public
 */
RedisClusterConnectionManager.prototype.destroy = function(connection) {
	connection.destroy();
}

/**
 * RedisClusterConnectionManager fetch connection.
 *
 * @param  {Function} cb callback function
 * @api public
 */
RedisClusterConnectionManager.prototype.fetchConnection = function(node, role, cb) {
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
	if (!targetDB) {
		return cb();
	}

	var parsedTargetDB = this.parseTargetDB(targetDB);

	var connection = this.poolMap[targetDB];
	if (!connection) {
		connection = this.createConnection(parsedTargetDB);
		connection['nodeName'] = node;
		connection['clientName'] = targetDB;
		this.poolMap[targetDB] = connection;
		// logger.debug('createConnection %s %s %j', node, role, targetDB);
	}

	return cb(null, connection);
}

RedisClusterConnectionManager.prototype.getTargetDB = function(node, role) {
	var targetNode = this.haClient.getClient(node, role);
	return targetNode;
}

RedisClusterConnectionManager.prototype.parseTargetDB = function(targetDB) {
	if (!targetDB) {
		return;
	}

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

RedisClusterConnectionManager.prototype.doParseTargetDB = function(targetDB) {
	var hosts = targetDB.split(":");
	if (hosts.length <= 1) {
		return;
	}

	var host = hosts[0];
	var port = parseInt(hosts[1]);

	return {
		host: host,
		port: port
	}
}

RedisClusterConnectionManager.prototype.bindEvents = function(connection) {
	connection.on("ready", function() {
		logger.info('redis %s %s ready', connection['nodeName'], connection['clientName']);
	});

	connection.on("connect", function() {
		logger.info('redis %s %s connect', connection['nodeName'], connection['clientName']);
	});

	connection.on("error", function(err) {
		logger.error('redis %s %s error %s', connection['nodeName'], connection['clientName'], err.stack);
	});

	connection.on("end", function() {
		logger.error('redis %s %s end', connection['nodeName'], connection['clientName']);
	});

	var haClient = this.haClient;
	var self = this;
	connection.on("end", function() {
		var nodeName = connection['nodeName'];
		var clientName = connection['clientName'];

		if (!haClient.checkValid(nodeName, clientName)) {
			self.removePoolNode(clientName);
		}
	});

	connection.on("drain", this.emit.bind(this, 'drain'));

	connection.on("idle", this.emit.bind(this, 'idle'));
}

/**
 * RedisClusterConnectionManager create connection.
 *
 * @api public
 */
RedisClusterConnectionManager.prototype.createConnection = function(dbOptions) {
	var options = this.getConnectionOptions();

	// logger.debug('createConnection %j %j', dbOptions, options);
	var connection = redis.createClient(dbOptions['port'], dbOptions['host'], options);
	this.bindEvents(connection);

	return this.postProcessConnection(connection);
}

/**
 * RedisClusterConnectionManager get connection options.
 *
 * @return  {Object} connection options
 * @api public
 */
RedisClusterConnectionManager.prototype.getConnectionOptions = function() {
	var options = this.options || {};
	options['auth_pass'] = this.password;
	options['retry_max_delay'] = this.retry_max_delay;

	return options
}

/**
 * RedisClusterConnectionManager post process connection.
 *
 * @param  {Object} connection
 * @api public
 */
RedisClusterConnectionManager.prototype.postProcessConnection = function(connection) {
	return connection;
}

/**
 * RedisClusterConnectionManager set password.
 *
 * @param  {String} password
 * @api public
 */
RedisClusterConnectionManager.prototype.setPassword = function(password) {
	this.password = password;
}

/**
 * RedisClusterConnectionManager get password.
 *
 * @return  {String} password
 * @api public
 */
RedisClusterConnectionManager.prototype.getPassword = function() {
	return this.password;
}

/**
 * RedisClusterConnectionManager set options.
 *
 * @param  {Object} options
 * @api public
 */
RedisClusterConnectionManager.prototype.setOptions = function(options) {
	this.options = options;
}

/**
 * RedisClusterConnectionManager get options.
 *
 * @return  {Object} options
 * @api public
 */
RedisClusterConnectionManager.prototype.getOptions = function() {
	return this.options;
}

/**
 * RedisClusterConnectionManager set pool.
 *
 * @return  {Object} pool
 * @api public
 */
RedisClusterConnectionManager.prototype.setPool = function(key, pool) {
	this.poolMap[key] = pool;
}

/**
 * RedisClusterConnectionManager get pool.
 *
 * @return  {Object} pool
 * @api public
 */
RedisClusterConnectionManager.prototype.getPool = function(key) {
	return this.poolMap;
}

/**
 * RedisClusterConnectionManager remove pool node.
 *
 * @return  {String} key pool key
 * @api private
 */
RedisClusterConnectionManager.prototype.removePoolNode = function(key) {
	var connection = this.poolMap[key];
	if (!connection) {
		return;
	}

	connection.end();
	delete this.poolMap[key];
}

module.exports = RedisClusterConnectionManager;