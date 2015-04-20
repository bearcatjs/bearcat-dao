/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao RedisClusterTemplate
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var commands = [
	'del', 'expire', 'ttl',
	'get', 'set', 'exists',
	'llen', 'lrem', 'lpush', 'lrange',
	'sadd', 'scard', 'smembers', 'srem',
	'zadd', 'zcard', 'zrangebyscore',
	'zrem', 'zrange', 'zremrangebyrank',
	'zscore'
];

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'RedisClusterTemplate');
var ShardingUtil = require('../../util/shardingUtil');
var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var Utils = require('../../util/utils');
var Util = require('util');

var shardingUtil = new ShardingUtil();
shardingUtil['shardingFile'] = Constant.REDIS_CLUSTER_MAP_PATH;

/**
 * RedisClusterTemplate constructor function.
 *
 * @api public
 */
var RedisClusterTemplate = function() {
	this.connectionManager = null;
	this.role = Constant.ROLE_MASTER;
}

Util.inherits(RedisClusterTemplate, EventEmitter);

RedisClusterTemplate.prototype.init = function() {
	var self = this;
	commands.forEach(function(command) {
		self[command] = function() {
			var args = arguments;
			self.runCommand(command, args);
		};
	});
}

RedisClusterTemplate.prototype.runCommand = function(command, args) {
	var key = args[0];
	this.getClientByKey(key, function(err, client) {
		if (!client) {
			var callback = args[args.length - 1];
			if (Utils.checkFunction(callback)) {
				callback(new Error('client is not exist for key: ' + key));
			}
			return;
		}

		client[command].apply(client, args);
	});
}

RedisClusterTemplate.prototype.getClientByKey = function(key, cb) {
	var clusterMap = shardingUtil.getClusterMap();
	if (!clusterMap) {
		return;
	}

	var hashValue = Utils.calHashValue(key, clusterMap.length);
	var target = clusterMap[hashValue];

	if (target && target['name']) {
		var redisName = target['name'];
		this.connectionManager.getConnection(redisName, this.role, cb);
	} else {
		cb();
	}
}

RedisClusterTemplate.prototype.restartHaClient = function() {
	this.connectionManager.restartHaClient();
}

module.exports = RedisClusterTemplate;