var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var utils = require('../../util/utils');
var mysql = require('mysql');
var util = require('util');

var mysqlConnectionManager = function() {
	this.port = Constant.DEFAULT_MYSQL_PORT;
	this.host = Constant.DEFAULT_MYSQL_HOST;
	this.user = null;
	this.password = null;
	this.database = null;
	this.options = {};
	this.usePool = Constant.DEFAULT_MYSQL_USE_POOL;
	this.connectionCb = Constant.DEFAULT_MYSQL_CONNECT_CB;
	this.pool = null;
}

util.inherits(mysqlConnectionManager, EventEmitter);

module.exports = mysqlConnectionManager;

mysqlConnectionManager.prototype.getConnection = function(cb) {
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

mysqlConnectionManager.prototype.genId = function(connection, tableName) {

}

mysqlConnectionManager.prototype.release = function(connection) {
	if (this.usePool) {
		connection.release();
	} else {
		connection.end();
	}
}

mysqlConnectionManager.prototype.end = function(connection) {
	connection.end();
}

mysqlConnectionManager.prototype.destroy = function(connection) {
	connection.destroy();
}

mysqlConnectionManager.prototype.fetchConnector = function(cb) {
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

mysqlConnectionManager.prototype.bindEvents = function(connection) {

}

mysqlConnectionManager.prototype.createPool = function() {
	var options = this.getConnectionOptions();

	var pool = mysql.createPool(options);

	return pool;
}

mysqlConnectionManager.prototype.createConnection = function() {
	var options = this.getConnectionOptions();

	var connection = mysql.createConnection(options);

	return connection;
}

mysqlConnectionManager.prototype.getConnectionOptions = function() {
	var options = this.options || {};
	options['host'] = this.host;
	options['port'] = this.port;
	options['user'] = this.user;
	options['password'] = this.password;
	options['database'] = this.database;

	return options
}

mysqlConnectionManager.prototype.postProcessConnection = function(connection) {
	return connection;
}

mysqlConnectionManager.prototype.setPort = function(port) {
	this.port = port;
}

mysqlConnectionManager.prototype.getPort = function() {
	return this.port;
}

mysqlConnectionManager.prototype.setHost = function(host) {
	this.host = host;
}

mysqlConnectionManager.prototype.getHost = function() {
	return this.host;
}

mysqlConnectionManager.prototype.setUser = function(user) {
	this.user = user;
}

mysqlConnectionManager.prototype.getUser = function() {
	return this.user;
}

mysqlConnectionManager.prototype.setPassword = function(password) {
	this.password = password;
}

mysqlConnectionManager.prototype.getPassword = function() {
	return this.password;
}

mysqlConnectionManager.prototype.setDatabase = function(database) {
	this.database = database;
}

mysqlConnectionManager.prototype.getDatabase = function() {
	return this.database;
}

mysqlConnectionManager.prototype.setOptions = function(options) {
	this.options = options;
}

mysqlConnectionManager.prototype.getOptions = function() {
	return this.options;
}

mysqlConnectionManager.prototype.setUsePool = function(usePool) {
	this.usePool = usePool;
}

mysqlConnectionManager.prototype.getUsePool = function() {
	return this.usePool;
}

mysqlConnectionManager.prototype.setPool = function(pool) {
	this.pool = pool;
}

mysqlConnectionManager.prototype.getPool = function() {
	return this.pool;
}