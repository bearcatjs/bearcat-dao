var logger = require('pomelo-logger').getLogger('bearcat-dao', 'ShardingUtil');
var Constant = require('./constant');
var FileUtil = require('./fileUtil');
var Utils = require('./utils');
var Path = require('path');

var ShardingUtil = {
	clusterMap: null,
	destDBAll: [],
	destDBMap: {}
};

ShardingUtil.getClusterMap = function() {
	var clusterMap = this.clusterMap;
	if (!clusterMap) {
		var bearcat = Utils.getBearcat();
		var applicationContext = bearcat.getApplicationContext();
		var env = applicationContext.getEnv();
		var configPath = applicationContext.getConfigPath();

		var clusterShardingPath = Path.join(configPath, env, Constant.CLUSTER_MAP_PATH);

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

ShardingUtil.initClusterMap = function(clusterMap) {
	for (var i = 0; i < clusterMap.length; i++) {
		var map = clusterMap[i];
		var name = map['name'];
		if (!this.destDBMap[name]) {
			this.destDBMap[name] = true;
			this.destDBAll.push(name);
		}
	}
}

ShardingUtil.getDestDBAll = function() {
	return this.destDBAll;
}

module.exports = ShardingUtil;