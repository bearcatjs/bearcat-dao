var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var redis = require('redis');
var util = require('util');

var redisConnection = function() {
	this.connection = null;
}

util.inherits(redisConnection, EventEmitter);

redisConnection.prototype.setConnection = function(connection) {
	this.connection = connection;
}

module.exports.createConnection = function(port, host, options) {
	var connection = redis.createClient(this.port, this.host, this.options);
	var rConnection = new redisConnection();
	rConnection.setConnection(connection);
	return rConnection;
}

module.exports.createConnectionUnix = function(unixDomain) {
	var connection = redis.createClient(this.unixDomain);
	var rConnection = new redisConnection();
	rConnection.setConnection(connection);
	return rConnection;
}