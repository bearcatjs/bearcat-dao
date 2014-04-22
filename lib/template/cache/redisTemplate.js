/**
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao RedisTemplate
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var EventEmitter = require('events').EventEmitter;
var utils = require('../../util/utils');
var util = require('util');

var RedisTemplate = function() {
	this.connectionManager = null;
	this.connection = null;
	this.expireDay = -1;
}

module.exports = RedisTemplate;

util.inherits(RedisTemplate, EventEmitter);

RedisTemplate.prototype.setConnectionManager = function(connectionManager) {
	this.connectionManager = connectionManager;
}

RedisTemplate.prototype.getConnectionManager = function() {
	return this.connectionManager;
}

RedisTemplate.prototype.setExpireDay = function(expireDay) {
	this.expireDay = expireDay;
}

RedisTemplate.prototype.getExpireDay = function() {
	return this.expireDay;
}

RedisTemplate.prototype.getConnection = function() {
	if (!this.connection) {
		this.connection = this.connectionManager.getConnection();
	}

	return this.connection;
}

RedisTemplate.prototype.send_command = function(command, args, cb, argumentsAll) {
	if (Array.isArray(args) && typeof cb === "function") {
		return this.getConnection().send_command(command, args, cb);
	} else {
		return this.getConnection().send_command(command, argumentsAll);
	}
}

RedisTemplate.prototype.addToCache = function(key, value, expire) {
	if (key == null || value == null) {
		return;
	}

	this.getConnection().set(key, value);
	this.expire(key, value);
}

RedisTemplate.prototype.addToList = function(key, value) {
	if (key == null || value == null) {
		return;
	}

	this.getConnection().rpush(key, value);
}

RedisTemplate.prototype.getStringFromList = function(args, cb) {
	var command = "lindex";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

RedisTemplate.prototype.getObjectFromList = function() {

}

RedisTemplate.prototype.getListLength = function(args, cb) {
	var command = "llen";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

RedisTemplate.prototype.getStringListRange = function(args, cb) {
	var command = "lrange";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

RedisTemplate.prototype.getObjectListRange = function() {

}

RedisTemplate.prototype.keyExists = function(args, cb) {
	var command = "exists";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

RedisTemplate.prototype.setStringToList = function(key, index, value) {
	if (key == null || value == null) {
		return;
	}
	this.getConnection().lset(key, index, value);
}

RedisTemplate.prototype.setObjectToList = function() {

}

RedisTemplate.prototype.deleteStringFromList = function(key, value) {
	if (key == null || value == null) {
		return;
	}
	this.getConnection().lrem(key, 0, value);
}

RedisTemplate.prototype.deleteStringsFromList = function(key, value) {
	if (key == null || value == null) {
		return;
	}
	if (Array.isArray(value)) {
		for (var i = 0; i < value.length; i++) {
			this.getConnection().lrem(key, 0, value[i]);
		}
	}
}

RedisTemplate.prototype.getString = function(args, cb) {
	var command = "get";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

RedisTemplate.prototype.delFromCache = function(key) {
	if (key == null) {
		return;
	}
	this.getConnection().del(key);
}

RedisTemplate.prototype.setCounter = function(key, initCount, expire) {
	this.addToCache(key, initCount, expire);
}

RedisTemplate.prototype.getCounter = function(args, cb) {
	return this.getString(args, cb);
}

RedisTemplate.prototype.incrBy = function(args, cb) {
	var com = "incrBy";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

RedisTemplate.prototype.expire = function(key, expire) {
	if (key == null) {
		return;
	}

	if (expire) {
		this.getConnection().expire(key, expire);
	} else if (this.expireDay) {
		this.getConnection().expire(key, this.expireDay);
	}
}