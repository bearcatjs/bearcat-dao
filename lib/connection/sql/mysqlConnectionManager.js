/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao MysqlConnectionManager
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var utils = require('../../util/utils');
var mysql = require('mysql');
var util = require('util');

/**
 * MysqlConnectionManager constructor function.
 *
 * @api public
 */
var MysqlConnectionManager = function() {
	this.pool = null;
	this.user = null;
	this.options = {};
	this.password = null;
	this.database = null;
	this.port = Constant.DEFAULT_MYSQL_PORT;
	this.host = Constant.DEFAULT_MYSQL_HOST;
	this.usePool = Constant.DEFAULT_MYSQL_USE_POOL;
	this.connectionCb = Constant.DEFAULT_MYSQL_CONNECT_CB;
	this.charset = null;
}

util.inherits(MysqlConnectionManager, EventEmitter);

module.exports = MysqlConnectionManager;

/**
 * MysqlConnectionManager get connection.
 *
 * @param  {Function} cb callback function
 * @api public
 */
MysqlConnectionManager.prototype.getConnection = function(cb) {
	var self = this;
	this.fetchConnector(function(err, connection) {
		if (err) {
			cb(err);
			return;
		}

		self.bindEvents(connection);

		cb(err, connection);
	});
}

MysqlConnectionManager.prototype.genId = function(connection, tableName) {

}

/**
 * MysqlConnectionManager release connection.
 *
 * @param  {Object} connection
 * @api public
 */
MysqlConnectionManager.prototype.release = function(connection) {
	if (this.usePool) {
		connection.release();
	} else {
		connection.end();
	}
}

/**
 * MysqlConnectionManager end connection.
 *
 * @param  {Object} connection
 * @api public
 */
MysqlConnectionManager.prototype.end = function(connection) {
	connection.end();
}

/**
 * MysqlConnectionManager destroy connection.
 *
 * @param  {Object} connection
 * @api public
 */
MysqlConnectionManager.prototype.destroy = function(connection) {
	connection.destroy();
}

/**
 * MysqlConnectionManager fetch connection.
 *
 * @param  {Function} cb callback function
 * @api public
 */
MysqlConnectionManager.prototype.fetchConnector = function(cb) {
	if (!utils.checkFunction(cb)) {
		cb = this.connectionCb;
	}
	if (this.usePool) {
		if (!this.pool) {
			this.setPool(this.createPool());
		}
		this.pool.getConnection(function(err, connection) {
			// connected! (unless `err` is set)
			cb(err, connection);
		});
	} else {
		var connection = this.createConnection();
		cb(null, connection);
	}
}

MysqlConnectionManager.prototype.bindEvents = function(connection) {

}

/**
 * MysqlConnectionManager create connection pool.
 *
 * @api public
 */
MysqlConnectionManager.prototype.createPool = function() {
	var options = this.getConnectionOptions();

	var pool = mysql.createPool(options);

	return pool;
}

/**
 * MysqlConnectionManager create connection.
 *
 * @api public
 */
MysqlConnectionManager.prototype.createConnection = function() {
	var options = this.getConnectionOptions();

	var connection = mysql.createConnection(options);

	return this.postProcessConnection(connection);
}

/**
 * MysqlConnectionManager get connection options.
 *
 * @return  {Object} connection options
 * @api public
 */
MysqlConnectionManager.prototype.getConnectionOptions = function() {
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
 * MysqlConnectionManager post process connection.
 *
 * @param  {Object} connection
 * @api public
 */
MysqlConnectionManager.prototype.postProcessConnection = function(connection) {
	return connection;
}

/**
 * MysqlConnectionManager set port.
 *
 * @param  {Number} port
 * @api public
 */
MysqlConnectionManager.prototype.setPort = function(port) {
	this.port = port;
}

/**
 * MysqlConnectionManager get port.
 *
 * @return  {Number} port
 * @api public
 */
MysqlConnectionManager.prototype.getPort = function() {
	return this.port;
}

/**
 * MysqlConnectionManager set host.
 *
 * @param  {String} host
 * @api public
 */
MysqlConnectionManager.prototype.setHost = function(host) {
	this.host = host;
}

/**
 * MysqlConnectionManager get host.
 *
 * @return  {String} host
 * @api public
 */
MysqlConnectionManager.prototype.getHost = function() {
	return this.host;
}

/**
 * MysqlConnectionManager set user.
 *
 * @param  {String} user username
 * @api public
 */
MysqlConnectionManager.prototype.setUser = function(user) {
	this.user = user;
}

/**
 * MysqlConnectionManager get user.
 *
 * @return  {String} username
 * @api public
 */
MysqlConnectionManager.prototype.getUser = function() {
	return this.user;
}

/**
 * MysqlConnectionManager set password.
 *
 * @param  {String} password
 * @api public
 */
MysqlConnectionManager.prototype.setPassword = function(password) {
	this.password = password;
}

/**
 * MysqlConnectionManager get password.
 *
 * @return  {String} password
 * @api public
 */
MysqlConnectionManager.prototype.getPassword = function() {
	return this.password;
}

/**
 * MysqlConnectionManager set database.
 *
 * @param  {String} database
 * @api public
 */
MysqlConnectionManager.prototype.setDatabase = function(database) {
	this.database = database;
}

/**
 * MysqlConnectionManager get database.
 *
 * @return  {String} database
 * @api public
 */
MysqlConnectionManager.prototype.getDatabase = function() {
	return this.database;
}

/**
 * MysqlConnectionManager set options.
 *
 * @param  {Object} options
 * @api public
 */
MysqlConnectionManager.prototype.setOptions = function(options) {
	this.options = options;
}

/**
 * MysqlConnectionManager get options.
 *
 * @return  {Object} options
 * @api public
 */
MysqlConnectionManager.prototype.getOptions = function() {
	return this.options;
}

/**
 * MysqlConnectionManager set usePool.
 *
 * @param  {Boolean} usePool
 * @api public
 */
MysqlConnectionManager.prototype.setUsePool = function(usePool) {
	this.usePool = usePool;
}

/**
 * MysqlConnectionManager get usePool.
 *
 * @return  {Boolean} usePool
 * @api public
 */
MysqlConnectionManager.prototype.getUsePool = function() {
	return this.usePool;
}

/**
 * MysqlConnectionManager set pool.
 *
 * @return  {Object} pool
 * @api public
 */
MysqlConnectionManager.prototype.setPool = function(pool) {
	this.pool = pool;
}

/**
 * MysqlConnectionManager get pool.
 *
 * @return  {Object} pool
 * @api public
 */
MysqlConnectionManager.prototype.getPool = function() {
	return this.pool;
}