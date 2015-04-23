/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao ShardingUtil
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'ShardingUtil');
var Constant = require('./constant');
var FileUtil = require('./fileUtil');
var Utils = require('./utils');
var Path = require('path');

var ShardingUtil = function() {
	this.clusterMap = null;
	this.destDBAll = [];
	this.destDBMap = {};
	this.shardingFile = null;
}

ShardingUtil.prototype.getClusterMap = function() {
	var clusterMap = this.clusterMap;
	if (!clusterMap) {
		var bearcat = Utils.getBearcat();
		var applicationContext = bearcat.getApplicationContext();
		var env = applicationContext.getEnv();
		var configPath = applicationContext.getConfigPath();

		var shardingFile = this.shardingFile || Constant.CLUSTER_MAP_PATH;
		var clusterShardingPath = Path.join(configPath, env, shardingFile);

		if (!FileUtil.existsSync(clusterShardingPath)) {
			logger.warn('getClusterMap [type]Sharding.json (type=redis, mysql) file %s is not exist ...', clusterShardingPath);
			return;
		}

		clusterMap = require(clusterShardingPath);
		this.initClusterMap(clusterMap);
		this.clusterMap = clusterMap;
	}

	return clusterMap;
}

ShardingUtil.prototype.initClusterMap = function(clusterMap) {
	for (var i = 0; i < clusterMap.length; i++) {
		var map = clusterMap[i];
		var name = map['name'];
		if (!this.destDBMap[name]) {
			this.destDBMap[name] = true;
			this.destDBAll.push(name);
		}
	}
}

ShardingUtil.prototype.getDestDBAll = function() {
	if (!this.clusterMap) {
		this.getClusterMap();
	}

	return this.destDBAll;
}

var mysqlSharding = null;
var redisSharding = null;

module.exports = function(type) {
	if (type == 'mysql') {
		if (!mysqlSharding) {
			mysqlSharding = new ShardingUtil();
			mysqlSharding['shardingFile'] = Constant.MYSQL_CLUSTER_MAP_PATH;
		}

		return mysqlSharding;
	}

	if (type == 'redis') {
		if (!redisSharding) {
			redisSharding = new ShardingUtil();
			redisSharding['shardingFile'] = Constant.REDIS_CLUSTER_MAP_PATH;
		}

		return redisSharding;
	}
}