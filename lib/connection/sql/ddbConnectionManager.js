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

var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var utils = require('../../util/utils');
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
	this.indexs = {};
	this.user = null;
	this.options = {};
	this.password = null;
	this.usePool = Constant.DEFAULT_MYSQL_USE_POOL;
	this.connectionCb = Constant.DEFAULT_MYSQL_CONNECT_CB;
	this.charset = null;
	this.clusterMap = require('./mock');
}

Util.inherits(DDBConnectionManager, EventEmitter);

/**
 * DDBConnectionManager get connection.
 *
 * @param  {Function} cb callback function
 * @api public
 */
DDBConnectionManager.prototype.getConnection = function(node, role, cb) {
	var self = this;
	this.fetchConnector(node, role, function(err, connection) {
		if (err) {
			cb(err);
			return;
		}

		self.bindEvents(connection);

		cb(err, connection);
	});
}

DDBConnectionManager.prototype.genId = function(connection, tableName) {

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
DDBConnectionManager.prototype.fetchConnector = function(node, role, cb) {
	if (!utils.checkFunction(cb)) {
		cb = this.connectionCb;
	}

	var targetDB = this.getTargetDB(node, role);
	var parsedTargetDB = this.parseTargetDB(targetDB);

	if (this.usePool) {
		if (!this.poolMap[targetDB]) {
			this.setPool(targetDB, this.createPool(parsedTargetDB));
		}
		this.poolMap[targetDB].getConnection(function(err, connection) {
			// connected! (unless `err` is set)
			cb(err, connection);
		});
	} else {
		var connection = this.createConnection(parsedTargetDB);
		cb(null, connection);
	}
}

DDBConnectionManager.prototype.getTargetDB = function(node, role) {
	var targetNode = this.clusterMap[node];

	if (!targetNode) {
		return;
	}

	if (role === Constant.ROLE_MASTER) {
		return targetNode['master'];
	}

	if (role === Constant.ROLE_SLAVE) {
		var index = getIndex(node);
		return targetNode['slaves'][index];
	}
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
		return;
	}

	var port = ports[0];
	var database = ports[1];

	return {
		host: host,
		port: port,
		database: database
	}
}

DDBConnectionManager.prototype.getIndex = function(node) {
	if (!this.indexs[node]) {
		this.indexs[node] = 0;
	}

	var index = this.indexs[node];
	var slaves = this.clusterMap[node]['slaves'];
	if (index >= slaves.length) {
		index = 0;
		this.indexs[node] = index;
	}

	return this.indexs[node] ++;
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