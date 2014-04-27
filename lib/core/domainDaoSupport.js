/**
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao DomainDaoSupport
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'DomainDaoSupport');
var BeanBuilderUtil = require('../util/beanBuilderUtil');
var SqlBuilderUtil = require('../util/sqlBuilderUtil');
var CountDownLatch = require('../util/countDownLatch');
var TableConfig = require('../support/tableConfig');
var FieldUtil = require('../util/fieldUtil');
var Constant = require('../util/constant');
var Utils = require('../util/utils');
var util = require('util');

/**
 * DomainDaoSupport constructor function.
 *
 * @api public
 */
var DomainDaoSupport = function() {
	this.tableConfig = null;
	this.sqlTemplate = null;
	this.cacheTemplate = null;
}

module.exports = DomainDaoSupport;

/**
 * DomainDaoSupport domain O/R mapping configuration.
 *
 * @param  {Object} domainConfig
 * {
 *	  func: 	 domain constructor function
 *	  tableName: O/R mapping tableName
 *	  primary:   primary fields array
 *	  fields:    normal fields array
 * }
 * @api public
 */
DomainDaoSupport.prototype.initConfig = function(domainConfig) {
	var func = domainConfig.func;
	var tableName = domainConfig.tableName;
	var primaryFields = domainConfig.primary || [];
	var fields = domainConfig.fields || [];
	if (!Utils.checkFunction(func)) {
		logger.error('domain object have no OR mapping info ' + domainConfig);
		return;
	}
	if (!tableName) {
		logger.error('domain object OR mapping info have no tableName ' + domainConfig);
		return;
	}

	var tableConfig = new TableConfig();
	tableConfig.setFunc(func);
	tableConfig.setTableName(tableName);
	tableConfig.setNormalFields(FieldUtil.buildFieldConfig(fields));
	tableConfig.setPrimaryFields(FieldUtil.buildFieldConfig(primaryFields));
	this.setTableConfig(tableConfig);
}

/**
 * DomainDaoSupport set table configuration.
 *
 * @param  {Object} tableConfig
 * @api public
 */
DomainDaoSupport.prototype.setTableConfig = function(tableConfig) {
	this.tableConfig = tableConfig;
}

/**
 * DomainDaoSupport get table configuration.
 *
 * @return  {Object} tableConfig
 * @api public
 */
DomainDaoSupport.prototype.getTableConfig = function() {
	return this.tableConfig;
}

/**
 * DomainDaoSupport set sqlTemplate.
 *
 * @param  {Object} sqlTemplate
 * @api public
 */
DomainDaoSupport.prototype.setSqlTemplate = function(sqlTemplate) {
	this.sqlTemplate = sqlTemplate;
}

/**
 * DomainDaoSupport get sqlTemplate.
 *
 * @return  {Object} sqlTemplate
 * @api public
 */
DomainDaoSupport.prototype.getSqlTemplate = function() {
	return this.sqlTemplate;
}

/**
 * DomainDaoSupport set cacheTemplate.
 *
 * @param  {Object} sqlTemplate
 * @api public
 */
DomainDaoSupport.prototype.setCacheTemplate = function(cacheTemplate) {
	this.cacheTemplate = cacheTemplate;
}

/**
 * DomainDaoSupport get cacheTemplate.
 *
 * @return  {Object} sqlTemplate
 * @api public
 */
DomainDaoSupport.prototype.getCacheTemplate = function() {
	return this.cacheTemplate;
}

/**
 * DomainDaoSupport do transaction with transactionStatus.
 *
 * @param  {Object} transactionStatus
 * @api public
 */
DomainDaoSupport.prototype.transaction = function(transactionStatus) {
	return this.getSqlTemplate().transaction(transactionStatus);
}

/**
 * DomainDaoSupport deleteById field id.
 *
 * @param  {Long} id
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.deleteById = function(id, cb) {
	var params = [id];

	return this.deleteByPrimaryKey(params, cb);
}

/**
 * DomainDaoSupport deleteByPrimaryKey.
 *
 * @param  {Array} primay fields array
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.deleteByPrimaryKey = function(params, cb) {
	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();
	var tableName = tableConfig.getTableName();

	var sql = SqlBuilderUtil.buildDeleteSql(tableName, FieldUtil.fieldToNames(primaryFields));

	return this.getSqlTemplate().updateRecord(sql, params, cb);
}

/**
 * DomainDaoSupport batchAdd O/R mapping objects.
 *
 * @param  {Array} O/R mapping objects
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.batchAdd = function(objects, cb) {
	if (!objects || !objects.length) {
		return cb();
	}

	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();
	var tableName = tableConfig.getTableName();
	var fields = tableConfig.getFields(); // all fields, include primary fields

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
					return cb(err);
				}

				return self.doBatchAdd(objects, cb);
			});

			for (var i = 0; i < objects.length; i++) {
				(function(object) {
					var id = object[name];
					if (!id) {
						self.getSqlTemplate().allocateRecordId(tableName, function(err, id) {
							if (err) {
								return cb(err);
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

/**
 * DomainDaoSupport batchAdd O/R mapping objects.
 *
 * @param  {Array} O/R mapping objects
 * @param  {Function} callback function
 * @api private
 */
DomainDaoSupport.prototype.doBatchAdd = function(objects, cb) {
	if (!objects || !objects.length) {
		return cb();
	}

	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();
	var tableName = tableConfig.getTableName();
	var fields = tableConfig.getFields(); // all fields, include primary fields

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
			return cb(err);
		}

		if (results) {
			cb(null, objects);
		} else {
			cb(null, null);
		}
	});
}

/**
 * DomainDaoSupport batchUpdate O/R mapping objects.
 *
 * @param  {Array} O/R mapping objects
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.batchUpdate = function(objects, cb) {
	if (!objects || !objects.length) {
		return cb();
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
				return cb(err);
			}

			if (results) {
				cb(null, objects);
			} else {
				cb(null, null);
			}
		});
	} else {
		logger.error('can not batchUpdate object without primary key');
		return cb();
	}
}

/**
 * DomainDaoSupport batchDelete O/R mapping objects.
 *
 * @param  {Array} O/R mapping objects
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.batchDelete = function(objects, cb) {
	if (!objects || !objects.length) {
		return cb();
	}

	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();
	var tableName = tableConfig.getTableName();
	var fields = tableConfig.getFields();

	if (primaryFields.length) {
		return this.batchDeleteByPrimaryKey(objects, cb);
	} else {
		logger.error('can not batchDelete object without primary key');
		return cb();
	}
}

/**
 * DomainDaoSupport batchDeleteByPrimaryKey O/R mapping objects.
 *
 * @param  {Array} O/R mapping objects
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.batchDeleteByPrimaryKey = function(objects, cb) {
	if (!objects || !objects.length) {
		return cb();
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

/**
 * DomainDaoSupport updateColumn with newValue select by primary fields.
 *
 * @param  {String} column name
 * @param  {String} update value
 * @param  {Array}  primary fields values
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.updateColumn = function(columnName, newValue, primarysValue, cb) {
	if (!Array.isArray(primarysValue)) {
		logger.error('primarysValue must be array');
		return cb();
	}

	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();

	if (primaryFields.length) {
		if (primarysValue.length !== primaryFields.length) {
			logger.error("primarysValue's size must equal with the primarykey's size");
			return cb();
		}

		var params = primarysValue;
		var columns = FieldUtil.fieldToNames(primaryFields);

		return this.updateColumnValue(columnName, newValue, columns, params, cb);
	} else {
		logger.error('can not update object without primary key');
		return cb();
	}
}

/**
 * DomainDaoSupport updateColumnValue with newValue select by condition fields.
 *
 * @param  {String} column name
 * @param  {String} update value
 * @param  {Array}  condition fields
 * @param  {Array}  condition fields values
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.updateColumnValue = function(columnName, newValue, conditionColumns, conditionValues, cb) {
	if (!Array.isArray(conditionColumns) || !Array.isArray(conditionValues)) {
		logger.error('conditionColumns or conditionValues must be array');
		return cb();
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

/**
 * DomainDaoSupport getList by sql, params.
 *
 * @param  {String} query sql
 * @param  {Array}  query values
 * @param  {Object} options
 * {
 *	 orderColumn: order column name
 *	 isAsc:       sort asc ?
 *	 limit:       limit number
 *	 offset:      offset number
 * }
 * @param  {Array}  condition fields values
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.getList = function(sql, params, options, cb) {
	var tableConfig = this.getTableConfig();
	var fields = tableConfig.getFields();
	var func = tableConfig.getFunc();
	var self = this;

	options = options || {};
	var orderColumn = options.orderColumn;
	var isAsc = options.isAsc;
	var limit = options.limit;
	var offset = options.offset;

	if (orderColumn) {
		sql = SqlBuilderUtil.appendOrder(sql, orderColumn, isAsc);
	}

	if (Utils.isNotNull(limit) && Utils.isNotNull(offset)) {
		sql = SqlBuilderUtil.appendLimit(sql, limit, offset);
	}

	return this.getSqlTemplate().executeQuery(sql, params, function(err, results) {
		if (err) {
			return cb(err);
		}

		var beanObjects = BeanBuilderUtil.buildObjectList(results, func, fields);
		cb(null, beanObjects);
	});
}

/**
 * DomainDaoSupport getList by primary fields params.
 *
 * @param  {Array}  query values
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.getByPrimary = function(params, cb) {
	var tableConfig = this.getTableConfig();
	var primaryFields = tableConfig.getPrimaryFields();
	var func = tableConfig.getFunc();

	if (params.length !== primaryFields.length) {
		logger.error('parameter size must be equal with the primary fields size');
		return cb();
	}

	var fields = FieldUtil.fieldToNames(tableConfig.getFields());
	var primaryFields = FieldUtil.fieldToNames(tableConfig.getPrimaryFields());
	var sql = SqlBuilderUtil.buildSelectSql(tableConfig.getTableName(), fields, primaryFields);

	return this.getSqlTemplate().executeQuery(sql, params, function(err, results) {
		if (err) {
			return cb(err);
		}

		var beanObjects = BeanBuilderUtil.buildObjectList(results, func, tableConfig.getFields());
		cb(null, beanObjects);
	});
}

/**
 * DomainDaoSupport getList by primary fields params.
 *
 * @param  {Array}  query values
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.getById = function(id, cb) {
	var params = [id];

	return this.getByPrimary(params, cb);
}

/**
 * DomainDaoSupport getList by sql, params.
 *
 * @param  {String} query sql
 * @param  {Array}  query values
 * @param  {Array}  condition fields values
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.get = function(sql, params, cb) {
	var tableConfig = this.getTableConfig();
	var func = tableConfig.getFunc();

	return this.getSqlTemplate().executeQuery(sql, params, function(err, results) {
		if (err) {
			return cb(err);
		}

		var beanObjects = BeanBuilderUtil.buildObjectList(results, func, tableConfig.getFields());
		cb(null, beanObjects);
	});
}

/**
 * DomainDaoSupport getCount by sql, params.
 *
 * @param  {String} query sql
 * @param  {Array}  query values
 * @param  {Array}  condition fields values
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.getCount = function(sql, params, cb) {
	return this.getSqlTemplate().queryCount(sql, params, cb);
}

/**
 * DomainDaoSupport add by sql, params or by O/R mapping object.
 *
 * @param  {String} query sql
 * @param  {Array}  query values
 * @param  {Function} callback function
 * OR
 * @param  {Object} O/R mapping object
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.add = function(sql, params, cb) {
	if (Utils.checkObject(sql) && Utils.checkFunction(params)) {
		return this.batchAdd([sql], params);
	}

	return this.getSqlTemplate().addRecord(sql, params, cb);
}

/**
 * DomainDaoSupport delete by sql, params or by O/R mapping object.
 *
 * @param  {String} query sql
 * @param  {Array}  query values
 * @param  {Function} callback function
 * OR
 * @param  {Object} O/R mapping object
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.delete = function(sql, params, cb) {
	if (Utils.checkObject(sql) && Utils.checkFunction(params)) {
		return this.batchDelete([sql], params);
	}

	return this.getSqlTemplate().updateRecord(sql, params, cb);
}

/**
 * DomainDaoSupport update by sql, params or by O/R mapping object.
 *
 * @param  {String} query sql
 * @param  {Array}  query values
 * @param  {Function} callback function
 * OR
 * @param  {Object} O/R mapping object
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.update = function(sql, params, cb) {
	if (Utils.checkObject(sql) && Utils.checkFunction(params)) {
		return this.batchUpdate([sql], params);
	}

	return this.getSqlTemplate().updateRecord(sql, params, cb);
}

/**
 * DomainDaoSupport allocate recordId for table.
 *
 * @param  {String} table name
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.allocateRecordId = function(tableName, cb) {
	return this.getSqlTemplate().allocateRecordId(tableName, cb);
}

var SQL_SELECT = "SELECT * FROM %s WHERE %s ";

var SQL_COUNT_SELECT = "SELECT count(*) num FROM %s WHERE %s ";

var SQL_OBJECT_SELECT = "SELECT * FROM %s WHERE %s ";

var REMOVE_OBJECT_SELECT = "DELETE FROM %s WHERE %s ";

/**
 * DomainDaoSupport getList by where.
 *
 * @param  {String}   where sql
 * @param  {Array}    query params
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.getByWhere = function(where, args, cb) {
	var tableConfig = this.getTableConfig();

	var sql = util.format(SQL_OBJECT_SELECT, tableConfig.getTableName(), where);

	return this.get(sql, args, cb);
}

/**
 * DomainDaoSupport getList by where.
 *
 * @param  {String}   where sql
 * @param  {Array}    query params
 * @param  {Object}   options
 * {
 *	 orderColumn: order column name
 *	 isAsc:       sort asc ?
 *	 limit:       limit number
 *	 offset:      offset number
 * }
 * @param  {Function} callback function
 * @api public
 */
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

	if (Utils.isNotNull(limit) && Utils.isNotNull(offset)) {
		sql = SqlBuilderUtil.appendLimit(sql, limit, offset);
	}

	return this.getList(sql, args, null, cb);
}

/**
 * DomainDaoSupport getCount by where.
 *
 * @param  {String}   where sql
 * @param  {Array}    query params
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.getCountByWhere = function(where, args, cb) {
	var tableConfig = this.getTableConfig();

	var sql = util.format(SQL_COUNT_SELECT, tableConfig.getTableName(), where);

	return this.getCount(sql, args, cb);
}

/**
 * DomainDaoSupport remove by where.
 *
 * @param  {String}   where sql
 * @param  {Array}    query params
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.removeByWhere = function(where, args, cb) {
	var tableConfig = this.getTableConfig();

	var sql = util.format(REMOVE_OBJECT_SELECT, tableConfig.getTableName(), where);

	return this.delete(sql, args, cb);
}

/**
 * DomainDaoSupport add to cache.
 *
 * @param  {String} cache key
 * @param  {String} cache value
 * @param  {Number} expire time
 * @api public
 */
DomainDaoSupport.prototype.addToCache = function(key, value, expire) {
	return this.getCacheTemplate().addToCache(key, value, expire);
}

/**
 * DomainDaoSupport get from cache.
 *
 * @param  {String}   cache key
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.getStringFromCache = function(key, cb) {
	return this.getCacheTemplate().getString(key, cb);
}

/**
 * DomainDaoSupport set counter to cache.
 *
 * @param  {String} cache key
 * @param  {Number} init count number
 * @param  {Number} expire time
 * @api public
 */
DomainDaoSupport.prototype.setCounter = function(key, initCount, expire) {
	return this.getCacheTemplate().setCounter(key, initCount, expire);
}

/**
 * DomainDaoSupport get counter from cache.
 *
 * @param  {String}   cache key
 * @param  {Function} callback function
 * @api public
 */
DomainDaoSupport.prototype.getCounter = function(key, cb) {
	return this.getCacheTemplate().getCounter(key, cb);
}

/**
 * DomainDaoSupport incr counter by 1.
 *
 * @param  {String}   cache key
 * @api public
 */
DomainDaoSupport.prototype.incr = function(key) {
	return this.getCacheTemplate().incr(key)
}

/**
 * DomainDaoSupport incr counter by increment.
 *
 * @param  {String}   cache key
 * @param  {Number}   increment number
 * @api public
 */
DomainDaoSupport.prototype.incrBy = function(key, increment) {
	return this.getCacheTemplate().incrBy(key, increment);
}

/**
 * DomainDaoSupport remove from cache.
 *
 * @param  {String}   cache key
 * @api public
 */
DomainDaoSupport.prototype.removeFromCache = function(key) {
	return this.getCacheTemplate().delFromCache(key);
}