/**
 * .______    _______     ___      .______       ______     ___   .__________.
 * |   _  )  |   ____)   /   \     |   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * |______)  |_______/__/     \__\ | _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao RedisConnectionManager
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var redis = require('redis');
var util = require('util');

var RedisConnectionManager = function() {
	this.port = Constant.DEFAULT_REDIS_PORT;
	this.host = Constant.DEFAULT_REDIS_HOST;
	this.password = null;
	this.unixDomain = null;
	this.options = null;
}

util.inherits(RedisConnectionManager, EventEmitter);

module.exports = RedisConnectionManager;

RedisConnectionManager.prototype.getConnection = function() {
	var connection = this.fetchConnector();
	this.bindEvents(connection);

	return this.postProcessConnection(connection);
}

RedisConnectionManager.prototype.release = function(connection) {
	connection.end();
}

RedisConnectionManager.prototype.getConnectionUnix = function() {
	var useUnixDomain = true;
	var connection = this.fetchConnector(useUnixDomain);
	this.bindEvents(connection);

	return this.postProcessConnection(connection);
}

RedisConnectionManager.prototype.fetchConnector = function(useUnixDomain) {
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

RedisConnectionManager.prototype.bindEvents = function(connection) {
	connection.on("ready", this.emit.bind(this, 'ready'));

	connection.on("connect", this.emit.bind(this, 'connect'));

	connection.on("error", this.emit.bind(this, 'error'));

	connection.on("end", this.emit.bind(this, 'end'));

	connection.on("drain", this.emit.bind(this, 'drain'));

	connection.on("idle", this.emit.bind(this, 'idle'));
}

RedisConnectionManager.prototype.postProcessConnection = function(connection) {
	return connection;
}

RedisConnectionManager.prototype.setPort = function(port) {
	this.port = port;
}

RedisConnectionManager.prototype.getPort = function() {
	return this.port;
}

RedisConnectionManager.prototype.setHost = function(host) {
	this.host = host;
}

RedisConnectionManager.prototype.getHost = function() {
	return this.host;
}

RedisConnectionManager.prototype.setPassword = function(password) {
	this.password = password;
}

RedisConnectionManager.prototype.getPassword = function() {
	return this.password;
}

RedisConnectionManager.prototype.setUnixDomain = function(unixDomain) {
	this.unixDomain = unixDomain;
}

RedisConnectionManager.prototype.getUnixDomain = function() {
	return this.unixDomain;
}

RedisConnectionManager.prototype.setOptions = function(options) {
	this.options = options;
}

RedisConnectionManager.prototype.getOptions = function() {
	return this.options;
}