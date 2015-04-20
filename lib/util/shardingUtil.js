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

		if (FileUtil.existsSync(clusterShardingPath)) {
			clusterMap = require(clusterShardingPath);
			this.initClusterMap(clusterMap);
			this.clusterMap = clusterMap;
		} else {
			logger.warn('getClusterMap clusterSharding.json file %s is not exist ...', clusterShardingPath);
		}
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

module.exports = ShardingUtil;