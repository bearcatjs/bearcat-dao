var EventEmitter = require('events').EventEmitter;
var utils = require('../../util/utils');
var util = require('util');

var redisTemplate = function() {
	this.connectionManager = null;
	this.connection = null;
	this.expireDay = -1;
}

util.inherits(redisTemplate, EventEmitter);

redisTemplate.prototype.setConnectionManager = function(connectionManager) {
	this.connectionManager = connectionManager;
}

redisTemplate.prototype.getConnectionManager = function() {
	return this.connectionManager;
}

redisTemplate.prototype.setExpireDay = function(expireDay) {
	this.expireDay = expireDay;
}

redisTemplate.prototype.getExpireDay = function() {
	return this.expireDay;
}

redisTemplate.prototype.getConnection = function() {
	if (!this.connection) {
		this.connection = this.connectionManager.getConnection();
	}

	return this.connection;
}

redisTemplate.prototype.send_command = function(command, args, cb, argumentsAll) {
	if (Array.isArray(args) && typeof cb === "function") {
		return this.getConnection().send_command(command, args, cb);
	} else {
		return this.getConnection().send_command(command, argumentsAll);
	}
}

redisTemplate.prototype.addToCache = function(key, value, expire) {
	if (key == null || value == null) {
		return;
	}

	this.getConnection().set(key, value);
	this.expire(key, value);
}

redisTemplate.prototype.addToList = function(key, value) {
	if (key == null || value == null) {
		return;
	}

	this.getConnection().rpush(key, value);
}

redisTemplate.prototype.getStringFromList = function(args, cb) {
	var command = "lindex";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

redisTemplate.prototype.getObjectFromList = function() {

}

redisTemplate.prototype.getListLength = function(args, cb) {
	var command = "llen";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

redisTemplate.prototype.getStringListRange = function(args, cb) {
	var command = "lrange";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

redisTemplate.prototype.getObjectListRange = function() {

}

redisTemplate.prototype.keyExists = function(args, cb) {
	var command = "exists";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

redisTemplate.prototype.setStringToList = function(key, index, value) {
	if (key == null || value == null) {
		return;
	}
	this.getConnection().lset(key, index, value);
}

redisTemplate.prototype.setObjectToList = function() {

}

redisTemplate.prototype.deleteStringFromList = function(key, value) {
	if (key == null || value == null) {
		return;
	}
	this.getConnection().lrem(key, 0, value);
}

redisTemplate.prototype.deleteStringsFromList = function(key, value) {
	if (key == null || value == null) {
		return;
	}
	if (Array.isArray(value)) {
		for (var i = 0; i < value.length; i++) {
			this.getConnection().lrem(key, 0, value[i]);
		}
	}
}

redisTemplate.prototype.getString = function(args, cb) {
	var command = "get";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

redisTemplate.prototype.delFromCache = function(key) {
	if (key == null) {
		return;
	}
	this.getConnection().del(key);
}

redisTemplate.prototype.setCounter = function(key, initCount, expire) {
	this.addToCache(key, initCount, expire);
}

redisTemplate.prototype.getCounter = function(args, cb) {
	return this.getString(args, cb);
}

redisTemplate.prototype.incrBy = function(args, cb) {
	var com = "incrBy";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

redisTemplate.prototype.expire = function(key, expire) {
	if (key == null) {
		return;
	}

	if (expire) {
		this.getConnection().expire(key, expire);
	} else if (this.expireDay) {
		this.getConnection().expire(key, this.expireDay);
	}
}

module.exports = redisTemplate;