/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao RedisConnectionManager
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var redis = require('redis');
var util = require('util');

/**
 * RedisConnectionManager constructor function.
 *
 * @api public
 */
var RedisConnectionManager = function() {
	this.port = Constant.DEFAULT_REDIS_PORT;
	this.host = Constant.DEFAULT_REDIS_HOST;
	this.password = null;
	this.unixDomain = null;
	this.options = null;
}

util.inherits(RedisConnectionManager, EventEmitter);

module.exports = RedisConnectionManager;

/**
 * RedisConnectionManager get connection.
 *
 * @api public
 */
RedisConnectionManager.prototype.getConnection = function() {
	var connection = this.fetchConnector();
	this.bindEvents(connection);

	return this.postProcessConnection(connection);
}

/**
 * RedisConnectionManager release connection.
 *
 * @param  {Object} connection
 * @api public
 */
RedisConnectionManager.prototype.release = function(connection) {
	connection.end();
}

/**
 * RedisConnectionManager get connection(unixDomain).
 *
 * @api public
 */
RedisConnectionManager.prototype.getConnectionUnix = function() {
	var useUnixDomain = true;
	var connection = this.fetchConnector(useUnixDomain);
	this.bindEvents(connection);

	return this.postProcessConnection(connection);
}

/**
 * RedisConnectionManager fetch connection.
 *
 * @param  {Boolean} useUnixDomain
 * @api public
 */
RedisConnectionManager.prototype.fetchConnector = function(useUnixDomain) {
	var connection = null;
	if (!useUnixDomain) {
		connection = redis.createClient(this.getPort(), this.getHost(), this.getOptions());
	} else {
		connection = redis.createClient(this.getUnixDomain());
	}

	var password = this.getPassword();
	if (password) {
		connection.auth(password)
	}

	return connection;
}

/**
 * RedisConnectionManager bind connection.
 *
 * @param  {Object} connection
 * @api public
 */
RedisConnectionManager.prototype.bindEvents = function(connection) {
	connection.on("ready", this.emit.bind(this, 'ready'));

	connection.on("connect", this.emit.bind(this, 'connect'));

	connection.on("error", this.emit.bind(this, 'error'));

	connection.on("end", this.emit.bind(this, 'end'));

	connection.on("drain", this.emit.bind(this, 'drain'));

	connection.on("idle", this.emit.bind(this, 'idle'));
}

/**
 * RedisConnectionManager post process connection.
 *
 * @param  {Object} connection
 * @api public
 */
RedisConnectionManager.prototype.postProcessConnection = function(connection) {
	return connection;
}

/**
 * RedisConnectionManager set port.
 *
 * @param  {Number} port
 * @api public
 */
RedisConnectionManager.prototype.setPort = function(port) {
	this.port = port;
}

/**
 * RedisConnectionManager get port.
 *
 * @return  {Number} port
 * @api public
 */
RedisConnectionManager.prototype.getPort = function() {
	return this.port;
}

/**
 * RedisConnectionManager set host.
 *
 * @param  {String} host
 * @api public
 */
RedisConnectionManager.prototype.setHost = function(host) {
	this.host = host;
}

/**
 * RedisConnectionManager get host.
 *
 * @param  {String} host
 * @api public
 */
RedisConnectionManager.prototype.getHost = function() {
	return this.host;
}

/**
 * RedisConnectionManager set password.
 *
 * @param  {String} password
 * @api public
 */
RedisConnectionManager.prototype.setPassword = function(password) {
	this.password = password;
}

/**
 * RedisConnectionManager get password.
 *
 * @return  {String} password
 * @api public
 */
RedisConnectionManager.prototype.getPassword = function() {
	return this.password;
}

/**
 * RedisConnectionManager set unixDomain.
 *
 * @param  {Boolean} unixDomain
 * @api public
 */
RedisConnectionManager.prototype.setUnixDomain = function(unixDomain) {
	this.unixDomain = unixDomain;
}

/**
 * RedisConnectionManager get unixDomain.
 *
 * @return  {Boolean} unixDomain
 * @api public
 */
RedisConnectionManager.prototype.getUnixDomain = function() {
	return this.unixDomain;
}

/**
 * RedisConnectionManager set options.
 *
 * @param  {Object} options
 * @api public
 */
RedisConnectionManager.prototype.setOptions = function(options) {
	this.options = options;
}

/**
 * RedisConnectionManager get options.
 *
 * @return  {Object} options
 * @api public
 */
RedisConnectionManager.prototype.getOptions = function() {
	return this.options;
}