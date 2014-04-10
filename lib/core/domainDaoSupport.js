/**
 * .______    _______     ___      .______       ______     ___   .__________.
 * |   _  )  |   ____)   /   \     |   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * |______)  |_______/__/     \__\ | _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao DomainDaoSupport
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao');
var BeanBuilderUtil = require('../util/beanBuilderUtil');
var SqlBuilderUtil = require('../util/sqlBuilderUtil');
var CountDownLatch = require('../util/countDownLatch');
var TableConfig = require('../support/tableConfig');
var FieldUtil = require('../util/fieldUtil');
var Constant = require('../util/constant');
var utils = require('../util/utils');
var util = require('util');

var DomainDaoSupport = function() {
	this.tableConfig = null;
	this.sqlTemplate = null;
	this.cacheTemplate = null;
}

module.exports = DomainDaoSupport;

DomainDaoSupport.prototype.initConfig = function(domainConfig) {
	var func = domainConfig.func;
	var tableName = domainConfig.tableName;
	var primaryFields = domainConfig.primary || [];
	var fields = domainConfig.fields || [];
	if (!utils.checkFunction(func)) {
		throw new Error('domain object have no OR mapping info ' + domainConfig);
	}
	if (!tableName) {
		throw new Error('domain object OR mapping info have no tableName ' + domainConfig);
	}

	var tableConfig = new TableConfig();
	tableConfig.setFunc(func);
	tableConfig.setTableName(tableName);
	tableConfig.setNormalFields(FieldUtil.buildFieldConfig(fields));
	tableConfig.setPrimaryFields(FieldUtil.buildFieldConfig(primaryFields));
	this.tableConfig = tableConfig;
}

DomainDaoSupport.prototype.setTableConfig = function(tableConfig) {
	this.tableConfig = tableConfig;
}

DomainDaoSupport.prototype.getTableConfig = function() {
	return this.tableConfig;
}

DomainDaoSupport.prototype.setSqlTemplate = function(sqlTemplate) {
	this.sqlTemplate = sqlTemplate;
}

DomainDaoSupport.prototype.getSqlTemplate = function() {
	return this.sqlTemplate;
}

DomainDaoSupport.prototype.setCacheTemplate = function(cacheTemplate) {
	this.cacheTemplate = cacheTemplate;
}

DomainDaoSupport.prototype.getCacheTemplate = function() {
	return this.cacheTemplate;
}

DomainDaoSupport.prototype.transaction = function(transactionStatus) {
	return this.getSqlTemplate().transaction(transactionStatus);
}

DomainDaoSupport.prototype.deleteById = function(id, cb) {
	var params = [id];

	return this.deleteByPrimaryKey(params, cb);
}

DomainDaoSupport.prototype.deleteByPrimaryKey = function(params, cb) {
	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();
	var tableName = tableConfig.getTableName();

	var sql = SqlBuilderUtil.buildDeleteSql(tableName, FieldUtil.fieldToNames(primaryFields));

	return this.getSqlTemplate().updateRecord(sql, params, cb);
}

DomainDaoSupport.prototype.batchAdd = function(objects, cb) {
	if (!objects || !objects.length) {
		cb();
		return [];
	}

	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();
	var tableName = tableConfig.getTableName();
	var fields = tableConfig.getFields(); // 全部的fields，包括 primary fields

	var type = "";
	var name = "";
	var self = this;
	if (primaryFields.length === 1) {
		var primaryField = primaryFields[0];
		type = primaryField.getType();
		name = primaryField.getName();
		if (type === Constant.TYPE_LONG) {
			var len = objects.length;
			var latch = CountDownLatch.createCountDownLatch(len, function(err) {
				if (err) {
					cb(err);
					return;
				}

				return self.doBatchAdd(objects, cb);
			});

			for (var i = 0; i < objects.length; i++) {
				(function(object) {
					var id = object[name];
					if (!id) {
						self.getSqlTemplate().allocateRecordId(tableName, function(err, id) {
							if (err) {
								cb(err);
								return;
							}

							object[name] = id;
							latch.done();
						});
					} else {
						latch.done();
					}
				})(objects[i]);
			}
		}
	} else {
		return self.doBatchAdd(objects, cb);
	}
}

DomainDaoSupport.prototype.doBatchAdd = function(objects, cb) {
	if (!objects || !objects.length) {
		cb();
		return [];
	}

	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();
	var tableName = tableConfig.getTableName();
	var fields = tableConfig.getFields(); // 全部的fields，包括 primary fields

	var paras = [];

	for (var i = 0; i < objects.length; i++) {
		for (var j = 0; j < fields.length; j++) {
			var field = fields[j];
			var name = field.getName();
			paras.push(objects[i][name]);
		}
	}

	var sql = SqlBuilderUtil.buildBatchInsertSql(tableConfig.getTableName(), FieldUtil.fieldToNames(fields),
		objects.length);

	return this.getSqlTemplate().addRecord(sql, paras, function(err, results) {
		if (err) {
			cb(err);
			return;
		}

		if (results) {
			cb(null, objects);
		} else {
			cb(null, null);
		}
	});
}

DomainDaoSupport.prototype.batchUpdate = function(objects, cb) {
	if (!objects || !objects.length) {
		cb();
		return null;
	}

	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();
	var tableName = tableConfig.getTableName();
	var fields = tableConfig.getFields();

	if (primaryFields.length) {
		var parasList = [];

		for (var i = 0; i < objects.length; i++) {
			var paras = [];
			for (var j = 0; j < fields.length; j++) {
				var field = fields[j];
				var name = field.getName();
				paras.push(objects[i][name]);
			}
			parasList.push(paras);
		}

		var normalColumns = FieldUtil.fieldToNames(tableConfig.getNormalFields());
		var conditionColumns = FieldUtil.fieldToNames(primaryFields);
		var sql = SqlBuilderUtil.buildUpdateSql(tableConfig.getTableName(), normalColumns, conditionColumns);
		return this.getSqlTemplate().batchUpdateRecords(sql, parasList, function(err, results) {
			if (err) {
				cb(err);
				return;
			}

			if (results) {
				cb(null, objects);
			} else {
				cb(null, null);
			}
		});
	} else {
		logger.error('can not update object without primary key');
		cb();
		return null;
	}
}

DomainDaoSupport.prototype.batchDelete = function(objects, cb) {
	if (!objects || !objects.length) {
		cb();
		return null;
	}

	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();
	var tableName = tableConfig.getTableName();
	var fields = tableConfig.getFields();

	if (primaryFields.length) {
		return this.batchDeleteByPrimaryKey(objects, cb);
	} else {
		var paras = [];

		for (var i = 0; i < objects.length; i++) {
			for (var j = 0; j < fields.length; j++) {
				var field = fields[j];
				var name = field.getName();
				paras.push(objects[i][name]);
			}
		}

		var sql = SqlBuilderUtil.buildBatchDeleteSql(tableConfig.getTableName(), FieldUtil.fieldToNames(fields),
			objects.length);

		return this.getSqlTemplate().updateRecord(sql, paras, cb);
	}
}

DomainDaoSupport.prototype.batchDeleteByPrimaryKey = function(objects, cb) {
	if (!objects || !objects.length) {
		cb();
		return null;
	}
	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();
	var paras = [];

	for (var i = 0; i < objects.length; i++) {
		for (var j = 0; j < primaryFields.length; j++) {
			var primaryField = primaryFields[j];
			var name = primaryField.getName();
			paras.push(objects[i][name]);
		}
	}

	var conditionColumns = FieldUtil.fieldToNames(primaryFields);
	var sql = SqlBuilderUtil.buildBatchDeleteSql(tableConfig.getTableName(), conditionColumns, objects.length);
	this.getSqlTemplate().updateRecord(sql, paras, cb);
}

DomainDaoSupport.prototype.updateColumn = function(columnName, newValue, primarysValue, cb) {
	if (!Array.isArray(primarysValue)) {
		logger.error('primarysValue must be array');
		cb();
		return false;
	}

	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();

	if (primaryFields.length) {
		if (primarysValue.length !== primaryFields.length) {
			logger.error("primarysValue's size must equal with the primarykey's size");
			cb();
			return false;
		}

		var params = primarysValue;
		var columns = FieldUtil.fieldToNames(primaryFields);

		return this.updateColumnValue(columnName, newValue, columns, params, cb);
	} else {
		logger.error('can not update object without primary key');
		cb();
		return false;
	}
}

DomainDaoSupport.prototype.updateColumnValue = function(columnName, newValue, conditionColumns, conditionValues, cb) {
	if (!Array.isArray(conditionColumns) || !Array.isArray(conditionValues)) {
		logger.error('conditionColumns or conditionValues must be array');
		cb();
		return false;
	}

	var tableConfig = this.getTableConfig();
	var params = [];
	params.push(newValue);

	for (var i = 0; i < conditionValues.length; i++) {
		params.push(conditionValues[i]);
	}

	var updateColumns = [];
	updateColumns.push(columnName);
	var sql = SqlBuilderUtil.buildUpdateSql(tableConfig.getTableName(), updateColumns, conditionColumns);
	return this.getSqlTemplate().updateRecord(sql, params, cb);
}

DomainDaoSupport.prototype.getList = function(sql, params, options, cb) {
	var tableConfig = this.getTableConfig();
	var fields = tableConfig.getFields();
	var func = tableConfig.getFunc();

	options = options || {};
	var orderColumn = options.orderColumn;
	var isAsc = options.isAsc;
	var limit = options.limit;
	var offset = options.offset;

	if (orderColumn) {
		sql = SqlBuilderUtil.appendOrder(sql, orderColumn, isAsc);
	}

	if (limit && offset) {
		sql = SqlBuilderUtil.appendLimit(sql, limit, offset);
	}

	return this.getSqlTemplate().executeQuery(sql, params, function(err, results) {
		if (err) {
			cb(err);
			return;
		}

		var beanObjects = BeanBuilderUtil.buildObjectList(results, func, fields);
		cb(null, beanObjects);
	});
}

DomainDaoSupport.prototype.getByPrimary = function(params, cb) {
	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();
	var func = tableConfig.getFunc();

	if (params.length !== primaryFields.length) {
		logger.error('parameter size must be equal with the primary fields size');
		cb();
		return null;
	}

	var fields = FieldUtil.fieldToNames(tableConfig.getFields());
	var primaryFields = FieldUtil.fieldToNames(tableConfig.getPrimaryFields());
	var sql = SqlBuilderUtil.buildSelectSql(tableConfig.getTableName(), fields, primaryFields);

	return this.getSqlTemplate().executeQuery(sql, params, function(err, results) {
		if (err) {
			cb(err);
			return;
		}

		var beanObjects = BeanBuilderUtil.buildObjectList(results, func, tableConfig.getFields());
		cb(null, beanObjects);
	});
}

DomainDaoSupport.prototype.getById = function(id, cb) {
	var params = [id];

	return this.getByPrimary(params, cb);
}

// the same as getList
DomainDaoSupport.prototype.get = function(sql, params, cb) {
	var tableConfig = this.getTableConfig();
	var func = tableConfig.getFunc();

	return this.getSqlTemplate().executeQuery(sql, params, function(err, results) {
		if (err) {
			cb(err);
			return;
		}

		var beanObjects = BeanBuilderUtil.buildObjectList(results, func, tableConfig.getFields());
		cb(null, beanObjects);
	});
}

DomainDaoSupport.prototype.getCount = function(sql, params, cb) {
	return this.getSqlTemplate().queryCount(sql, params, cb);
}

DomainDaoSupport.prototype.add = function(sql, params, cb) {
	return this.getSqlTemplate().addRecord(sql, params, cb);
}

DomainDaoSupport.prototype.delete = function(sql, params, cb) {
	return this.getSqlTemplate().updateRecord(sql, params, cb);
}

DomainDaoSupport.prototype.update = function(sql, params, cb) {
	return this.getSqlTemplate().updateRecord(sql, params, cb);
}

DomainDaoSupport.prototype.allocateRecordId = function(tableName, cb) {
	return this.getSqlTemplate().allocateRecordId(tableName, cb);
}

DomainDaoSupport.prototype.addToCacheOnly = function() {

}

DomainDaoSupport.prototype.getStringFromCache = function() {

}

DomainDaoSupport.prototype.setCounter = function(key, initCount, expire) {
	return this.cacheTemplate().setCounter(key, initCount, expire);
}

DomainDaoSupport.prototype.getCounter = function(key, cb) {
	return this.cacheTemplate().getCounter(key, cb);
}

DomainDaoSupport.prototype.incr = function() {

}

DomainDaoSupport.prototype.incrBy = function() {

}

DomainDaoSupport.prototype.removeFromCache = function(key) {
	return this.cacheTemplate().delFromCache(key);
}

var SQL_SELECT = "SELECT * FROM %s WHERE %s ";

var SQL_COUNT_SELECT = "SELECT count(*) num FROM %s WHERE %s ";

var SQL_OBJECT_SELECT = "SELECT * FROM %s WHERE %s ";

var REMOVE_OBJECT_SELECT = "DELETE FROM %s WHERE %s ";

DomainDaoSupport.prototype.getByWhere = function(where, args, cb) {
	var tableConfig = this.getTableConfig();

	var sql = util.format(SQL_OBJECT_SELECT, tableConfig.getTableName(), where);

	return this.get(sql, args, cb);
}

DomainDaoSupport.prototype.getListByWhere = function(where, args, options, cb) {
	var tableConfig = this.getTableConfig();

	var sql = util.format(SQL_SELECT, tableConfig.getTableName(), where);

	options = options || {};
	var orderColumn = options.orderColumn;
	var isAsc = options.isAsc;
	var limit = options.limit;
	var offset = options.offset;

	if (orderColumn) {
		sql = SqlBuilderUtil.appendOrder(sql, orderColumn, isAsc);
	}

	if (limit && offset) {
		sql = SqlBuilderUtil.appendLimit(sql, limit, offset);
	}

	return this.getList(sql, args, null, cb);
}

DomainDaoSupport.prototype.getCountByWhere = function(where, args, cb) {
	var tableConfig = this.getTableConfig();

	var sql = util.format(SQL_COUNT_SELECT, tableConfig.getTableName(), where);

	return this.getCount(sql, args, cb);
}

DomainDaoSupport.prototype.removeByWhere = function(where, args, cb) {
	var tableConfig = this.getTableConfig();

	var sql = util.format(REMOVE_OBJECT_SELECT, tableConfig.getTableName(), where);

	return this.delete(sql, args, cb);
}