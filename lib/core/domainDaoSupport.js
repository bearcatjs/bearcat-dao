/*!
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

var SQL_SELECT = "SELECT * FROM %s WHERE %s ";
var SQL_COUNT_SELECT = "SELECT count(*) num FROM %s WHERE %s ";
var SQL_OBJECT_SELECT = "SELECT * FROM %s WHERE %s ";
var REMOVE_OBJECT_SELECT = "DELETE FROM %s WHERE %s ";

/**
 * DomainDaoSupport constructor function.
 *
 * @api public
 */
var DomainDaoSupport = function() {
	this.tableConfig = null;
	this.sqlTemplate = null;
	this.cacheTemplate = null;
	this.domainMap = {};
	this.modelId = null;
}

/**
 * DomainDaoSupport model mapping configuration.
 * init domainDaoSupport with domainConfig to set up model mapping
 * if domainConfig is string type, then do initModelConfig
 *
 * 用domainConfig来初始化domainDaoSupport, 设置model mapping
 * 如果 domainConfig 不是对象，而是String类型，则initModelConfig
 *
 * @param  {Object}   domainConfig domain model mapping configuration
 * @param  {Function} domainConfig.func domain constructor function
 * @param  {String}   domainConfig.tableName model mapping tableName
 * @param  {Array}    domainConfig.primary primary fields array
 * @param  {Array}    domainConfig.fields normal fields array
 * @api public
 */
DomainDaoSupport.prototype.initConfig = function(domainConfig) {
	if (Utils.checkString(domainConfig)) {
		return this.initModelConfig(domainConfig);
	}

	this.doInitConfig(domainConfig);
}

/**
 * DomainDaoSupport model mapping configuration with modelId.
 * init domainDaoSupport with modelId to set up model mapping
 *
 * 用modelId指定的bearcat model来初始化domainDaoSupport, 设置 model mapping
 * 如果 domainConfig 不是对象，而是String类型，则initModelConfig
 *
 * @param  {String}   modelId
 * @api public
 */
DomainDaoSupport.prototype.initModelConfig = function(modelId) {
	if (modelId) {
		this.modelId = modelId;
	} else {
		modelId = this.modelId;
	}

	var bearcat = Utils.getBearcat();
	if (bearcat.state < 4) { // bearcat has not been started
		return;
	}

	var beanFactory = bearcat.getBeanFactory();
	var modelDefinition = beanFactory.getModelDefinition(modelId);
	var mid = modelDefinition.getMid();
	var table = modelDefinition.getTable();
	var fieldMap = modelDefinition.getFields();

	var primary = [];
	var fields = [];

	for (var fieldKey in fieldMap) {
		var fieldValue = fieldMap[fieldKey];
		if (fieldValue.isPrimary()) {
			var fieldType = fieldValue.getType();
			primary.push({
				name: fieldKey,
				type: fieldType
			})
		} else {
			fields.push(fieldKey);
		}
	}

	var domainConfig = {
		mid: mid,
		tableName: table,
		primary: primary,
		fields: fields
	}

	this.doInitConfig(domainConfig);
}

/**
 * DomainDaoSupport do model mapping configuration.
 * init domainDaoSupport with domainConfig to set up model mapping
 *
 * 用domainConfig来初始化domainDaoSupport, 设置model mapping
 *
 * @param  {Object}   domainConfig domain model mapping configuration
 * @param  {Function} domainConfig.func domain constructor function
 * @param  {String}   domainConfig.tableName model mapping tableName
 * @param  {Array}    domainConfig.primary primary fields array
 * @param  {Array}    domainConfig.fields normal fields array
 * @api private
 */
DomainDaoSupport.prototype.doInitConfig = function(domainConfig) {
	var mid = domainConfig.mid;
	var func = domainConfig.func;
	var tableName = domainConfig.tableName;
	var primaryFields = domainConfig.primary || [];
	var fields = domainConfig.fields || [];

	if (!Utils.checkFunction(func) && !Utils.checkString(mid)) {
		logger.error('domain object have no mapping info %j', domainConfig);
		return;
	}

	var tableConfig = new TableConfig();
	tableConfig.setMid(mid);
	tableConfig.setFunc(func);
	tableConfig.setTableName(tableName);
	tableConfig.setNormalFields(FieldUtil.buildFieldConfig(fields));
	tableConfig.setPrimaryFields(FieldUtil.buildFieldConfig(primaryFields));
	this.setTableConfig(tableConfig);
}

/**
 * DomainDaoSupport get domain model mapping configuration.
 * get domainConfig when doing multi table query
 *
 * 多表查询的时候获取domainConfig
 *
 * @param  {Object}   domainConfig domain model mapping configuration
 * @param  {Function} domainConfig.func domain constructor function
 * @param  {String}   domainConfig.key domain cache key
 * @param  {Array}    domainConfig.primary primary fields array
 * @param  {Array}    domainConfig.fields normal fields array
 * @api public
 */
DomainDaoSupport.prototype.getConfig = function(domainConfig) {
	var func = domainConfig.func;
	var key = domainConfig.key;
	var primaryFields = domainConfig.primary || [];
	var fields = domainConfig.fields || [];

	if (!Utils.checkFunction(func)) {
		logger.error('domain object have no mapping info ' + domainConfig);
		return;
	}

	if (key) {
		var domain = this.getDomainMap(key);
		if (domain) {
			return domain;
		}
	}

	var tableConfig = new TableConfig();
	tableConfig.setFunc(func);
	tableConfig.setNormalFields(FieldUtil.buildFieldConfig(fields));
	tableConfig.setPrimaryFields(FieldUtil.buildFieldConfig(primaryFields));

	if (key) {
		this.setDomainMap(key, tableConfig);
	}

	return tableConfig;
}

/*!
 * DomainDaoSupport set table configuration.
 *
 * @param  {Object} tableConfig
 * @api public
 */
DomainDaoSupport.prototype.setTableConfig = function(tableConfig) {
	this.tableConfig = tableConfig;
}

/*!
 * DomainDaoSupport get table configuration.
 *
 * @return  {Object} tableConfig
 * @api public
 */
DomainDaoSupport.prototype.getTableConfig = function() {
	if (!this.tableConfig) {
		this.initModelConfig();
	}

	return this.tableConfig;
}

/*!
 * DomainDaoSupport set sqlTemplate.
 *
 * @param  {Object} sqlTemplate
 * @api public
 */
DomainDaoSupport.prototype.setSqlTemplate = function(sqlTemplate) {
	this.sqlTemplate = sqlTemplate;
}

/*!
 * DomainDaoSupport get sqlTemplate.
 *
 * @return  {Object} sqlTemplate
 * @api public
 */
DomainDaoSupport.prototype.getSqlTemplate = function() {
	return this.sqlTemplate;
}

/*!
 * DomainDaoSupport set cacheTemplate.
 *
 * @param  {Object} cacheTemplate
 * @api public
 */
DomainDaoSupport.prototype.setCacheTemplate = function(cacheTemplate) {
	this.cacheTemplate = cacheTemplate;
}

/*!
 * DomainDaoSupport get cacheTemplate.
 *
 * @return  {Object} cacheTemplate
 * @api public
 */
DomainDaoSupport.prototype.getCacheTemplate = function() {
	return this.cacheTemplate;
}

/*!
 * DomainDaoSupport get domain map from cache key.
 *
 * @param  {String} key cache key
 * @return {Object} cached domain
 * @api public
 */
DomainDaoSupport.prototype.getDomainMap = function(key) {
	return this.domainMap[key];
}

/*!
 * DomainDaoSupport set domain map from cache key.
 *
 * @param  {String} key cache key
 * @param  {Object} tableConfig table domain configuration
 * @api public
 */
DomainDaoSupport.prototype.setDomainMap = function(key, tableConfig) {
	this.domainMap[key] = tableConfig;
}

/**
 * DomainDaoSupport do transaction with transactionStatus.
 * transaction should be in transaction context to hold the same connection.
 * dao should implement this method to keep the transaction context.
 *
 * 事务需要在同一个connection中完成,这点由transactionStatus来保证
 * dao 需要实现 transaction 方法，来把transactionStatus表示的事务状态传给底层的sqlTemplate
 *
 *<pre><code class="language-javascript">
 *SimpleDao.prototype.transaction = function(txStatus) {
 *	this.domainDaoSupport.transaction(txStatus);
 *	return this;
 *}
 *</code></pre>
 *
 * @param  {Object} transactionStatus
 * @api public
 */
DomainDaoSupport.prototype.transaction = function(transactionStatus) {
	return this.getSqlTemplate().transaction(transactionStatus);
}

/**
 * DomainDaoSupport deleteById field id.
 * id must be the unique primary key
 *
 * id 必须是唯一主键
 *
 * @param  {Long}     id
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.deleteById = function(id, cb) {
	var params = [id];

	return this.deleteByPrimaryKey(params, cb);
}

/**
 * DomainDaoSupport deleteByPrimaryKey.
 * params fields must be corresponded to what your domain defines primary fields
 *
 * params 参数的顺序必须和domain里面主键定义的顺序相对应
 *
 * @param  {Array}    params primay fields array
 * @param  {Function} cb callback function
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
 * DomainDaoSupport batchAdd model mapping objects.
 * objects are model mapping domain instances array
 * if primary field is single and its type is Long
 * you do not need set this field when batchAdd
 * bearcat-dao will generate this unique id for your objects
 *
 * objects 是model mapping对应的domain对象实例数组
 * 如果主键是唯一的类型为Long的,通常情况下这个是一个自增的字段
 * 这时batchAdd的domain对象可以不设置该字段的值
 * bearcat-dao 会为这些domain对象生成唯一的id值
 *
 * @param  {Array}    objects model mapping objects
 * @param  {Function} cb callback function
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
	if (primaryFields.length > 1) {
		return self.doBatchAdd(objects, cb);
	}

	var primaryField = primaryFields[0];
	type = primaryField.getType();
	name = primaryField.getName();

	if (type !== Constant.TYPE_LONG && type !== Constant.TYPE_NUMBER) {
		return self.doBatchAdd(objects, cb);
	}

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

					BeanBuilderUtil.modelSet(object, name, id);

					latch.done();
				});
			} else {
				latch.done();
			}
		})(objects[i]);
	}
}

/**
 * DomainDaoSupport batchAdd model mapping objects.
 *
 * @param  {Array}    objects model mapping objects
 * @param  {Function} cb callback function
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
			var value = BeanBuilderUtil.modelGet(objects[i], name);

			paras.push(value);
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
 * DomainDaoSupport batchUpdate model mapping objects.
 * domain objects fields must be fullfilled when batchUpdate
 * a good practise is update what you get
 *
 * 当batchUpdate的时候，domain对象的所有属性必须都有值
 * 一个好的实践就是更新你所查询的domain对象
 *
 * @param  {Array}    objects model mapping objects
 * @param  {Function} cb callback function
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
				var value = BeanBuilderUtil.modelGet(objects[i], name);

				paras.push(value);
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
 * DomainDaoSupport batchDelete model mapping objects.
 * doamin objects primary fields must be fullfilled
 *
 * domain 对象的主键字段对应的值必须要有
 *
 * @param  {Array}    objects model mapping objects
 * @param  {Function} cb callback function
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
 * DomainDaoSupport batchDeleteByPrimaryKey model mapping objects.
 *
 * @param  {Array}    objects model mapping objects
 * @param  {Function} cb callback function
 * @api private
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
			var value = objects[i][name];
			if (!value) {
				value = objects[i].$get(name);
			}

			paras.push(value);
		}
	}

	var conditionColumns = FieldUtil.fieldToNames(primaryFields);
	var sql = SqlBuilderUtil.buildBatchDeleteSql(tableConfig.getTableName(), conditionColumns, objects.length);
	this.getSqlTemplate().updateRecord(sql, paras, cb);
}

/**
 * DomainDaoSupport updateColumn with newValue select by primary fields.
 *
 * 以主键作为查询条件来更新某个字段的值
 * @param  {String}   columnName column name
 * @param  {String}   newValue update value
 * @param  {Array}    primarysValue primary fields values
 * @param  {Function} cb callback function
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
 * 以查询条件字段作为查询条件来更新某个字段的值
 *
 * @param  {String}   columnName column name
 * @param  {String}   newValue update value
 * @param  {Array}    conditionColumns condition fields
 * @param  {Array}    conditionValues condition fields values
 * @param  {Function} cb callback function
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
 * select by sql, query params, and the result will be mapped to model mapping domain objects
 * in options you can pass to set order, limit, offset
 * sql can be sql template id to specific sql, prefixed with $, "$testResult" for example
 * if options is string type, it means the resultSet mapping modelId
 *
 * 根据sql，params来进行查询，查询结果会model mapping到domain对象
 * 在options里，你可以传入order, limit, offset
 * sql 可以是 sql template id，以 $ 开头，比如 "$testResult"
 *
 * @param  {String}   sql query sql
 * @param  {Array}    params query values
 * @param  {Object}   options
 * @param  {String}   options.orderColumn order column name
 * @param  {Boolean}  options.isAsc sort asc ?
 * @param  {Number}   options.limit limit number
 * @param  {Number}   options.offset offset number
 * @param  {Object}   options.domain domain configuration when doing multi table query
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.getList = function(sql, params, options, cb) {
	sql = SqlBuilderUtil.getSql(sql);

	var tableConfig = this.getTableConfig();

	var mid = tableConfig.getMid();
	var fields = tableConfig.getFields();
	var func = tableConfig.getFunc();
	var self = this;

	if (Utils.checkString(options)) {
		mid = options || mid;
		options = {};
	}

	if (Utils.checkFunction(options)) {
		cb = options;
		options = {};
	}

	options = options || {};
	var orderColumn = options.orderColumn;
	var isAsc = options.isAsc;
	var limit = options.limit;
	var offset = options.offset;
	var domain = options.domain;
	var mid = options.mid || mid;

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

		var beanObjects = null;

		if (mid) {
			beanObjects = BeanBuilderUtil.buildModels(mid, results);
			return cb(null, beanObjects);
		}

		if (domain) {
			var domainConfig = self.getConfig(domain);
			beanObjects = BeanBuilderUtil.buildObjectList(results, domainConfig.getFunc(), domainConfig.getFields());
		} else {
			beanObjects = BeanBuilderUtil.buildObjectList(results, func, fields);
		}

		cb(null, beanObjects);
	});
}

/**
 * DomainDaoSupport getList by primary fields params.
 * params fields must be corresponded to what your domain defines primary fields
 *
 * params 参数的顺序必须和domain里面主键定义的顺序相对应
 * 根据主键来进行查询列表
 *
 * @param  {Array}    params query values
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.getByPrimary = function(params, cb) {
	var tableConfig = this.getTableConfig();

	var mid = tableConfig.getMid();
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

		if (mid) {
			beanObjects = BeanBuilderUtil.buildModels(mid, results);
			return cb(null, beanObjects);
		}

		var beanObjects = BeanBuilderUtil.buildObjectList(results, func, tableConfig.getFields());
		cb(null, beanObjects);
	});
}

/**
 * DomainDaoSupport getList by id.
 * id must be the unique primary key
 *
 * id 必须是唯一主键
 *
 * @param  {Long}     id
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.getById = function(id, cb) {
	var params = [id];

	return this.getByPrimary(params, cb);
}

/**
 * DomainDaoSupport getList by sql, params.
 *
 * select by sql, query params, and the result will be mapped to model mapping domain objects
 *
 * 根据sql，params来进行查询，查询结果会model mapping到domain对象
 *
 * @param  {String}   sql query sql
 * @param  {Array}    params query values
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.get = function(sql, params, cb) {
	var tableConfig = this.getTableConfig();

	var mid = tableConfig.getMid();
	var func = tableConfig.getFunc();

	return this.getSqlTemplate().executeQuery(sql, params, function(err, results) {
		if (err) {
			return cb(err);
		}

		if (mid) {
			beanObjects = BeanBuilderUtil.buildModels(mid, results);
			return cb(null, beanObjects);
		}

		var beanObjects = BeanBuilderUtil.buildObjectList(results, func, tableConfig.getFields());
		cb(null, beanObjects);
	});
}

/**
 * DomainDaoSupport getCount by sql, params.
 *
 * select count by sql, query params
 *
 * 根据sql，params来查询数量
 *
 * @param  {String}   sql query sql
 * @param  {Array}    params query values
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.getCount = function(sql, params, cb) {
	return this.getSqlTemplate().queryCount(sql, params, cb);
}

/**
 * DomainDaoSupport add by sql, params or by model mapping object.
 *
 * 通过sql，params来添加数据 或者 通过 model mapping 的 domain object 对象来添加数据
 *
 * @param  {String}   sql query sql
 * @param  {Array}    params query values
 * @param  {Function} cb callback function
 * @param  {Object}   objects model mapping object
 * @param  {Function} cb callback function
 *
 * @api public
 */
DomainDaoSupport.prototype.add = function(sql, params, cb) {
	if (Utils.checkObject(sql) && Utils.checkFunction(params)) {
		return this.batchAdd([sql], params);
	}

	return this.getSqlTemplate().addRecord(sql, params, cb);
}

/**
 * DomainDaoSupport delete by sql, params or by model mapping object.
 *
 * 通过sql，params来删除数据 或者 通过 model mapping 的 domain object 对象来删除数据
 *
 * @param  {String}   sql query sql
 * @param  {Array}    params query values
 * @param  {Function} cb callback function
 
 * @param  {Object}   objects model mapping object
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.delete = function(sql, params, cb) {
	if (Utils.checkObject(sql) && Utils.checkFunction(params)) {
		return this.batchDelete([sql], params);
	}

	return this.getSqlTemplate().updateRecord(sql, params, cb);
}

/**
 * DomainDaoSupport update by sql, params or by model mapping object.
 *
 * 通过sql，params来更新数据 或者 通过 model mapping 的 domain object 对象来更新数据
 *
 * @param  {String}   sql query sql
 * @param  {Array}    params query values
 * @param  {Function} cb callback function
 
 * @param  {Object}   objects model mapping object
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.update = function(sql, params, cb) {
	if (Utils.checkObject(sql) && Utils.checkFunction(params)) {
		return this.batchUpdate([sql], params);
	}

	return this.getSqlTemplate().updateRecord(sql, params, cb);
}

/**
 * DomainDaoSupport exists by sql, params.
 * if exist, result will true, otherwise result will false
 *
 * 如果存在，cb结果是true，否则是false
 *
 * @param  {String}   sql query sql
 * @param  {Array}    params query values
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.exists = function(sql, params, cb) {
	return this.getSqlTemplate().existRecord(sql, params, cb);
}

/**
 * DomainDaoSupport allocate recordId for table.
 *
 * 为表申请主键id的值
 *
 * @param  {String}   tableName table name
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.allocateRecordId = function(tableName, cb) {
	return this.getSqlTemplate().allocateRecordId(tableName, cb);
}

/**
 * DomainDaoSupport getList by where.
 *
 * select by where sql, query params, and the result will be mapped to model mapping domain objects
 *
 * 根据where查询sql，params来进行查询，查询结果会model mapping到domain对象
 *
 * @param  {String}   where where sql
 * @param  {Array}    args query params
 * @param  {Function} cb callback function
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
 * select by sql, query params, and the result will be mapped to model mapping domain objects
 * in options you can pass to set order, limit, offset
 * sql can be sql template id to specific sql, prefixed with $, "$testResult" for example
 * if options is string type, it means the resultSet mapping modelId
 *
 * 根据sql，params来进行查询，查询结果会model mapping到domain对象
 * 在options里，你可以传入order, limit, offset
 * sql 可以是 sql template id，以 $ 开头，比如 "$testResult"
 *
 * @param  {String}   where where sql
 * @param  {Array}    args query params
 * @param  {Object}   options
 * @param  {String}   options.orderColumn order column name
 * @param  {Boolean}  options.isAsc sort asc ?
 * @param  {Number}   options.limit limit number
 * @param  {Number}   options.offset offset number
 * @param  {Object}   options.domain domain configuration when doing multi table query
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.getListByWhere = function(where, args, options, cb) {
	var tableConfig = this.getTableConfig();

	var mid = tableConfig.getMid();

	var sql = util.format(SQL_SELECT, tableConfig.getTableName(), where);

	if (Utils.checkString(options)) {
		mid = options || mid;
		options = {};
	}

	if (Utils.checkFunction(options)) {
		cb = options;
		options = {};
	}

	options = options || {};
	var orderColumn = options.orderColumn;
	var isAsc = options.isAsc;
	var limit = options.limit;
	var offset = options.offset;
	var domain = options.domain;
	var mid = options.mid || mid;

	var opt = {};

	if (orderColumn) {
		sql = SqlBuilderUtil.appendOrder(sql, orderColumn, isAsc);
	}

	if (Utils.isNotNull(limit) && Utils.isNotNull(offset)) {
		sql = SqlBuilderUtil.appendLimit(sql, limit, offset);
	}

	if (domain) {
		opt['domain'] = domain;
	}

	if (mid) {
		opt['mid'] = mid;
	}

	return this.getList(sql, args, opt, cb);
}

/**
 * DomainDaoSupport getCount by where.
 *
 * select count by where sql, query params
 *
 * 根据where查询sql，params来查询数量
 *
 * @param  {String}   where where sql
 * @param  {Array}    args query params
 * @param  {Function} cb callback function
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
 * remove by where sql, query params
 *
 * 根据where查询sql，params来进行删除
 *
 * @param  {String}   where where sql
 * @param  {Array}    args query params
 * @param  {Function} cb callback function
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
 * add key:value cache, if pass expire, it will set expire time in seconds
 *
 * 添加key:value缓存,如果传了expire，则会设置expire的过期时间, expire单位为秒
 *
 * @param  {String} key cache key
 * @param  {String} value cache value
 * @param  {Number} expire expire time
 * @api public
 */
DomainDaoSupport.prototype.addToCache = function(key, value, expire) {
	return this.getCacheTemplate().addToCache(key, value, expire);
}

/**
 * DomainDaoSupport get from cache.
 *
 * 通过key来查询string value
 *
 * @param  {String}   key cache key
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.getStringFromCache = function(key, cb) {
	return this.getCacheTemplate().getString(key, cb);
}

/**
 * DomainDaoSupport set counter to cache.
 *
 * set counter with initCount, if pass expire, it will set expire time in seconds
 *
 * 设置一个计数器，初始值为InitCount, 如果传了expire，则会设置expire的过期时间, expire单位为秒
 *
 * @param  {String} key cache key
 * @param  {Number} initCount init count number
 * @param  {Number} expire expire time
 * @api public
 */
DomainDaoSupport.prototype.setCounter = function(key, initCount, expire) {
	return this.getCacheTemplate().setCounter(key, initCount, expire);
}

/**
 * DomainDaoSupport get counter from cache.
 *
 * 查询key对应的计数器的值
 *
 * @param  {String}   key cache key
 * @param  {Function} cb callback function
 * @api public
 */
DomainDaoSupport.prototype.getCounter = function(key, cb) {
	return this.getCacheTemplate().getCounter(key, cb);
}

/**
 * DomainDaoSupport incr counter by 1.
 *
 * 计数器增加值1
 *
 * @param  {String}   key cache key
 * @api public
 */
DomainDaoSupport.prototype.incr = function(key) {
	return this.getCacheTemplate().incr(key)
}

/**
 * DomainDaoSupport incr counter by increment.
 *
 * 计数器增加值increment
 *
 * @param  {String}   key cache key
 * @param  {Number}   increment increment number
 * @api public
 */
DomainDaoSupport.prototype.incrBy = function(key, increment) {
	return this.getCacheTemplate().incrBy(key, increment);
}

/**
 * DomainDaoSupport remove from cache.
 *
 * 从cache删除key对应的值
 *
 * @param  {String}   key cache key
 * @api public
 */
DomainDaoSupport.prototype.removeFromCache = function(key) {
	return this.getCacheTemplate().delFromCache(key);
}

module.exports = DomainDaoSupport;