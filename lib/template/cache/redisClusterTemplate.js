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

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'RedisClusterTemplate');
var ShardingUtil = require('../../util/shardingUtil');
var MultiCommand = require('./command/multiCommand');
var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var Utils = require('../../util/utils');
var Util = require('util');

var shardingUtil = ShardingUtil("redis");
// shardingUtil['shardingFile'] = Constant.REDIS_CLUSTER_MAP_PATH;

var REDIS_CLUSTER_COMMANDS = Constant.REDIS_CLUSTER_COMMANDS;

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
	REDIS_CLUSTER_COMMANDS.forEach(function(command) {
		self[command] = function() {
			self.runCommand(command, arguments);
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

// tx transaction flag, means cmds with the same key
RedisClusterTemplate.prototype.multi = function(cmds, tx) {
	return new MultiCommand(cmds, this, tx);
}

RedisClusterTemplate.prototype.getClientByKey = function(key, cb) {
	var clusterMap = shardingUtil.getClusterMap();
	if (!clusterMap) {
		return cb(new Error('getClientByKey redis clusterMap null'));
	}

	var hashValue = Utils.calHashValue(key, clusterMap.length);
	var target = clusterMap[hashValue];

	if (target && target['name']) {
		var redisName = target['name'];
		return this.connectionManager.getConnection(redisName, this.role, cb);
	}

	cb(new Error('getClientByKey redis target client not exist'));
}

RedisClusterTemplate.prototype.getClientByNode = function(node, cb) {
	this.connectionManager.getConnection(node, this.role, cb);
}

RedisClusterTemplate.prototype.restartHaClient = function() {
	this.connectionManager.restartHaClient();
}

module.exports = RedisClusterTemplate;