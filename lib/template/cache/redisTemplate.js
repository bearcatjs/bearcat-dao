/*!
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

/**
 * RedisTemplate constructor function.
 *
 * @api public
 */
var RedisTemplate = function() {
	this.connectionManager = null;
	this.connection = null;
	this.expireDay = -1;
}

module.exports = RedisTemplate;

util.inherits(RedisTemplate, EventEmitter);

/**
 * RedisTemplate set connection manager.
 *
 * @param  {Object} connectionManager connection manager
 * @api public
 */
RedisTemplate.prototype.setConnectionManager = function(connectionManager) {
	this.connectionManager = connectionManager;
}

/**
 * RedisTemplate get connection manager.
 *
 * @return  {Object} connection manager
 * @api public
 */
RedisTemplate.prototype.getConnectionManager = function() {
	return this.connectionManager;
}

/**
 * RedisTemplate set expire day.
 *
 * @param  {Boolean} expireDay expire day
 * @api public
 */
RedisTemplate.prototype.setExpireDay = function(expireDay) {
	this.expireDay = expireDay;
}

/**
 * RedisTemplate get expire day.
 *
 * @return  {Boolean} expire day
 * @api public
 */
RedisTemplate.prototype.getExpireDay = function() {
	return this.expireDay;
}

/**
 * RedisTemplate get connection.
 *
 * @return  {Object} connection
 * @api public
 */
RedisTemplate.prototype.getConnection = function() {
	if (!this.connection) {
		this.connection = this.connectionManager.getConnection();
	}

	return this.connection;
}

/**
 * RedisTemplate send_command proxy to node-redis client send_command method.
 *
 * @api private
 */
RedisTemplate.prototype.send_command = function(command, args, cb, argumentsAll) {
	if (Array.isArray(args) && typeof cb === "function") {
		return this.getConnection().send_command(command, args, cb);
	} else {
		return this.getConnection().send_command(command, argumentsAll);
	}
}

/**
 * RedisTemplate add to redis cache, simple key:value.
 *
 * @param  {String} key cache key
 * @param  {String} value cache value
 * @param  {Number} expire expire time
 * @api public
 */
RedisTemplate.prototype.addToCache = function(key, value, expire) {
	if (key == null || value == null) {
		return;
	}

	this.getConnection().set(key, value);
	if (expire != null) {
		this.expire(key, expire);
	}
}

/**
 * RedisTemplate add to redis cache array, key:[].
 *
 * @param  {String} key cache key
 * @param  {String} value cache value
 * @api public
 */
RedisTemplate.prototype.addToList = function(key, value) {
	if (key == null || value == null) {
		return;
	}

	this.getConnection().rpush(key, value);
}

/**
 * RedisTemplate get string from redis array, use lindex redis command.
 *
 * @api public
 */
RedisTemplate.prototype.getStringFromList = function(args, cb) {
	var command = "lindex";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

/**
 * RedisTemplate get redis array length, use llen redis command.
 *
 * @api public
 */
RedisTemplate.prototype.getListLength = function(args, cb) {
	var command = "llen";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

/**
 * RedisTemplate get redis array range value, use lrange redis command.
 *
 * @api public
 */
RedisTemplate.prototype.getStringListRange = function(args, cb) {
	var command = "lrange";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

/**
 * RedisTemplate check key if exists in redis.
 *
 * @api public
 */
RedisTemplate.prototype.keyExists = function(args, cb) {
	var command = "exists";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

/**
 * RedisTemplate set string to redis list.
 *
 * @param  {String} key cache key
 * @param  {Number} index list index
 * @param  {String} value cache value
 * @api public
 */
RedisTemplate.prototype.setStringToList = function(key, index, value) {
	if (key == null || value == null) {
		return;
	}
	this.getConnection().lset(key, index, value);
}

/**
 * RedisTemplate delete string from redis list.
 *
 * @param  {String} key cache key
 * @param  {String} value cache value
 * @api public
 */
RedisTemplate.prototype.deleteStringFromList = function(key, value) {
	if (key == null || value == null) {
		return;
	}
	this.getConnection().lrem(key, 0, value);
}

/**
 * RedisTemplate delete strings from redis list.
 *
 * @param  {String} key cache key
 * @param  {Array}  value cache values
 * @api public
 */
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

/**
 * RedisTemplate get key value from redis.
 *
 * @param  {String} cache key
 * @api public
 */
RedisTemplate.prototype.getString = function(args, cb) {
	var command = "get";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

/**
 * RedisTemplate del key from redis.
 *
 * @param  {String} key cache key
 * @api public
 */
RedisTemplate.prototype.delFromCache = function(key) {
	if (key == null) {
		return;
	}
	this.getConnection().del(key);
}

/**
 * RedisTemplate set counter.
 *
 * @param  {String} key cache key
 * @param  {Number} initCount
 * @param  {Number} expire expire time
 * @api public
 */
RedisTemplate.prototype.setCounter = function(key, initCount, expire) {
	this.addToCache(key, initCount, expire);
}

/**
 * RedisTemplate get counter.
 *
 * @param  {String}   cache key
 * @param  {Function} callback function
 * @api public
 */
RedisTemplate.prototype.getCounter = function(args, cb) {
	return this.getString(args, cb);
}

/**
 * RedisTemplate incr by increment.
 *
 * @param  {String}   cache key
 * @param  {Number}   increment number
 * @param  {Function} callback function
 * @api public
 */
RedisTemplate.prototype.incrBy = function(args, cb) {
	var command = "incrBy";
	return this.send_command(command, args, cb, utils.to_array(arguments));
}

/**
 * RedisTemplate incr by 1.
 *
 * @param  {String}   key cache key
 * @api public
 */
RedisTemplate.prototype.incr = function(key) {
	return this.getConnection().incr(key);
}

/**
 * RedisTemplate set expire key.
 *
 * @param  {String}   key cache key
 * @param  {Number}   expire expire time
 * @api public
 */
RedisTemplate.prototype.expire = function(key, expire) {
	if (key == null) {
		return;
	}

	if (expire) {
		this.getConnection().expire(key, expire);
	} else if (this.getExpireDay()) {
		this.getConnection().expire(key, this.expireDay);
	}
}