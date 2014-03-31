var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var redis = require('redis');
var util = require('util');

var redisConnectionManager = function() {
	this.port = Constant.DEFAULT_REDIS_PORT;
	this.host = Constant.DEFAULT_REDIS_HOST;
	this.password = null;
	this.unixDomain = null;
	this.options = null;
}

util.inherits(redisConnectionManager, EventEmitter);

module.exports = redisConnectionManager;

redisConnectionManager.prototype.getConnection = function() {
	var connection = this.fetchConnector();
	this.bindEvents(connection);

	return this.postProcessConnection(connection);
}

redisConnectionManager.prototype.release = function(connection) {
	connection.end();
}

redisConnectionManager.prototype.getConnectionUnix = function() {
	var useUnixDomain = true;
	var connection = this.fetchConnector(useUnixDomain);
	this.bindEvents(connection);

	return this.postProcessConnection(connection);
}

redisConnectionManager.prototype.fetchConnector = function(useUnixDomain) {
	var connection = null;
	if (!useUnixDomain) {
		connection = redis.createClient(this.port, this.host, this.options);
	} else {
		connection = redis.createClient(this.unixDomain);
	}

	var password = this.getPassword();
	if (password) {
		connection.auth(password)
	}

	return connection;
}

redisConnectionManager.prototype.bindEvents = function(connection) {
	connection.on("ready", this.emit.bind(this, 'ready'));

	connection.on("connect", this.emit.bind(this, 'connect'));

	connection.on("error", this.emit.bind(this, 'error'));

	connection.on("end", this.emit.bind(this, 'end'));

	connection.on("drain", this.emit.bind(this, 'drain'));

	connection.on("idle", this.emit.bind(this, 'idle'));
}

redisConnectionManager.prototype.postProcessConnection = function(connection) {
	return connection;
}

redisConnectionManager.prototype.setPort = function(port) {
	this.port = port;
}

redisConnectionManager.prototype.getPort = function() {
	return this.port;
}

redisConnectionManager.prototype.setHost = function(host) {
	this.host = host;
}

redisConnectionManager.prototype.getHost = function() {
	return this.host;
}

redisConnectionManager.prototype.setPassword = function(password) {
	this.password = password;
}

redisConnectionManager.prototype.getPassword = function() {
	return this.password;
}

redisConnectionManager.prototype.setUnixDomain = function(unixDomain) {
	this.unixDomain = unixDomain;
}

redisConnectionManager.prototype.getUnixDomain = function() {
	return this.unixDomain;
}

redisConnectionManager.prototype.setOptions = function(options) {
	this.options = options;
}

redisConnectionManager.prototype.getOptions = function() {
	return this.options;
}