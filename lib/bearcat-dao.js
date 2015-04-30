/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao App
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'app');
var ShardingUtil = require('./util/shardingUtil');
var SqlLoader = require('./loader/sqlLoader');
var PlanHelper = require('./plan/planHelper');
var Package = require('../package.json');
var Utils = require('./util/utils');

var BearcatDao = {
	configLocations: [],
	version: Package.version,
	sqlLoader: new SqlLoader()
};

BearcatDao.getSQL = function(sqlId) {
	return this.sqlLoader.getSQL(sqlId);
}

BearcatDao.loadSQL = function(configLocations) {
	if (!Utils.checkArray(configLocations)) {
		logger.error('configLocations must be Array.');
		return;
	}

	this.addConfigLocations(configLocations);
	this.sqlLoader.load(configLocations);
}

BearcatDao.addConfigLocations = function(locations) {
	this.configLocations = this.configLocations.concat(locations);
}

BearcatDao.calDestDB = PlanHelper.calDestDB;

BearcatDao.calDestDBs = PlanHelper.calDestDBs;

BearcatDao.getDestDBAll = PlanHelper.getDestDBAll;

BearcatDao.getShardingUtil = function(type) {
	return ShardingUtil(type);
} 

module.exports = BearcatDao;