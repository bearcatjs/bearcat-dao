var logger = require('pomelo-logger').getLogger('bearcat-dao', 'PlanHelper');
var ShardingUtil = require('../util/shardingUtil');
var Constant = require('../util/constant');
var SqlUtil = require('../util/sqlUtil');
var Utils = require('../util/utils');

var shardingUtil = ShardingUtil("mysql");
// shardingUtil['shardingFile'] = Constant.MYSQL_CLUSTER_MAP_PATH;

var PlanHelper = {
	cacheDBMap: {}
}

PlanHelper.getDestDB = function(selectDefinition) {
	if (selectDefinition == Constant.DEST_DB_ALL) {
		return shardingUtil.getDestDBAll();
	}

	var destDB = this.getDestDBFromCache(selectDefinition);
	if (destDB) {
		return destDB;
	}

	destDB = [];

	var tableList = selectDefinition.getTableList();
	var bearcat = Utils.getBearcat();
	var beanFactory = bearcat.getBeanFactory();
	var balanceTableMap = {};

	for (var i = 0; i < tableList.length; i++) {
		var table = tableList[i];
		var tableName = table.getName();

		var modelDefinition = beanFactory.getModelDefinitionByTable(tableName);
		if (!modelDefinition) {
			continue;
		}

		var balance = modelDefinition.getBalance();
		if (!balance) {
			continue;
		}

		balanceTableMap[balance] = modelDefinition;
	}

	var conditionList = selectDefinition.getConditionList();

	var hasTargetDB = false;

	for (var i = 0; i < conditionList.length; i++) {
		var condition = conditionList[i];
		var conditionName = condition.getName();
		var conditionRelate = condition.getRelate();
		var conditionValues = condition.getValues();

		// balance condition
		if (SqlUtil.getRelate(conditionRelate) != Constant.SELECT_CONDITION_EQUAL) {
			continue;
		}

		if (!conditionValues) {
			continue;
		}

		if (conditionValues[0].length > 1) {
			continue;
		}

		var conditionValue = conditionValues[0][0]['text'];
		var tableModelDefinition = balanceTableMap[conditionName];

		if (!tableModelDefinition) {
			continue;
		}

		var tableName = tableModelDefinition.getTable();

		// balance equal condition
		var db = this.calDestDB(tableName, conditionName, conditionValue);
		destDB.push(db);
		hasTargetDB = true;
	}

	if (!hasTargetDB) {
		destDB = shardingUtil.getDestDBAll();
	}

	this.setDestDBCache(selectDefinition, destDB);
	return destDB;
}

PlanHelper.calDestDB = function(table, field, value) {
	var key = table + field + value;
	var clusterMap = shardingUtil.getClusterMap();
	if (!clusterMap) {
		return;
	}

	var hashValue = Utils.calHashValue(key, clusterMap.length);
	var target = clusterMap[hashValue];

	// logger.debug('calDestDB hashValue %d target %j', hashValue, target);
	if (target && target['name']) {
		return target['name'];
	}
}

PlanHelper.calDestDBs = function(table, field, values) {
	if (!Utils.checkArray(values)) {
		return [this.calDestDB(table, field, values)];
	}

	var dbs = [];

	for (var i = 0; i < values.length; i++) {
		dbs.push(this.calDestDB(table, field, values[i]));
	}

	return dbs;
}

PlanHelper.getDestDBFromCache = function(selectDefinition) {
	var originalSQL = selectDefinition.getOriginalSQL();

	return this.cacheDBMap[originalSQL];
}

PlanHelper.setDestDBCache = function(selectDefinition, destDB) {
	var originalSQL = selectDefinition.getOriginalSQL();

	this.cacheDBMap[originalSQL] = destDB;
}

PlanHelper.getDestDBAll = shardingUtil.getDestDBAll.bind(shardingUtil);

module.exports = PlanHelper;