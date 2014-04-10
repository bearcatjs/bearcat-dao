/**
 * .______    _______     ___      .______       ______     ___   .__________.
 * |   _  )  |   ____)   /   \     |   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * |______)  |_______/__/     \__\ | _| `.____) (______)__/     \__\  |__|
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
}

util.inherits(MysqlConnectionManager, EventEmitter);

module.exports = MysqlConnectionManager;

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

MysqlConnectionManager.prototype.release = function(connection) {
	if (this.usePool) {
		connection.release();
	} else {
		connection.end();
	}
}

MysqlConnectionManager.prototype.end = function(connection) {
	connection.end();
}

MysqlConnectionManager.prototype.destroy = function(connection) {
	connection.destroy();
}

MysqlConnectionManager.prototype.fetchConnector = function(cb) {
	if (!utils.checkFunction(cb)) {
		cb = this.connectionCb;
	}
	if (this.usePool) {
		if (!this.pool) {
			this.pool = this.createPool();
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

MysqlConnectionManager.prototype.createPool = function() {
	var options = this.getConnectionOptions();

	var pool = mysql.createPool(options);

	return pool;
}

MysqlConnectionManager.prototype.createConnection = function() {
	var options = this.getConnectionOptions();

	var connection = mysql.createConnection(options);

	return connection;
}

MysqlConnectionManager.prototype.getConnectionOptions = function() {
	var options = this.options || {};
	options['host'] = this.host;
	options['port'] = this.port;
	options['user'] = this.user;
	options['password'] = this.password;
	options['database'] = this.database;

	return options
}

MysqlConnectionManager.prototype.postProcessConnection = function(connection) {
	return connection;
}

MysqlConnectionManager.prototype.setPort = function(port) {
	this.port = port;
}

MysqlConnectionManager.prototype.getPort = function() {
	return this.port;
}

MysqlConnectionManager.prototype.setHost = function(host) {
	this.host = host;
}

MysqlConnectionManager.prototype.getHost = function() {
	return this.host;
}

MysqlConnectionManager.prototype.setUser = function(user) {
	this.user = user;
}

MysqlConnectionManager.prototype.getUser = function() {
	return this.user;
}

MysqlConnectionManager.prototype.setPassword = function(password) {
	this.password = password;
}

MysqlConnectionManager.prototype.getPassword = function() {
	return this.password;
}

MysqlConnectionManager.prototype.setDatabase = function(database) {
	this.database = database;
}

MysqlConnectionManager.prototype.getDatabase = function() {
	return this.database;
}

MysqlConnectionManager.prototype.setOptions = function(options) {
	this.options = options;
}

MysqlConnectionManager.prototype.getOptions = function() {
	return this.options;
}

MysqlConnectionManager.prototype.setUsePool = function(usePool) {
	this.usePool = usePool;
}

MysqlConnectionManager.prototype.getUsePool = function() {
	return this.usePool;
}

MysqlConnectionManager.prototype.setPool = function(pool) {
	this.pool = pool;
}

MysqlConnectionManager.prototype.getPool = function() {
	return this.pool;
}