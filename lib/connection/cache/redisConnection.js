/**
 * .______    _______     ___      .______       ______     ___   .__________.
 * |   _  )  |   ____)   /   \     |   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * |______)  |_______/__/     \__\ | _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao RedisConnection
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var redis = require('redis');
var util = require('util');

var RedisConnection = function() {
	this.connection = null;
}

util.inherits(RedisConnection, EventEmitter);

RedisConnection.prototype.setConnection = function(connection) {
	this.connection = connection;
}

module.exports.createConnection = function(port, host, options) {
	var connection = redis.createClient(this.port, this.host, this.options);
	var rConnection = new RedisConnection();
	rConnection.setConnection(connection);
	return rConnection;
}

module.exports.createConnectionUnix = function(unixDomain) {
	var connection = redis.createClient(this.unixDomain);
	var rConnection = new RedisConnection();
	rConnection.setConnection(connection);
	return rConnection;
}