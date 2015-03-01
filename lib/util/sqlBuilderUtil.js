/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao SqlBuilderUtil
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var BearcatDao = require('../bearcat-dao');
var Constant = require('./constant');
var Utils = require('./utils');

var SqlBuilderUtil = {};

module.exports = SqlBuilderUtil;

/**
 * SqlBuilderUtil build insert sql
 *
 * @param  {String} tableName table name
 * @param  {Array}  columns column names
 * @param  {String} sql result
 * @api public
 */
SqlBuilderUtil.buildInsertSql = function(tableName, columns) {
	return SqlBuilderUtil.buildBatchInsertSql(tableName, columns, 1);
}

/**
 * SqlBuilderUtil build batch insert sql
 *
 * @param   {String} tableName table name
 * @param   {Array}  columns column names
 * @param   {Number} batchSize batch size
 * @return  {String} sql result
 * @api private
 */
SqlBuilderUtil.buildBatchInsertSql = function(tableName, columns, batchSize) {
	var result = "";

	result += "insert into ";
	result += tableName;
	result += " (";
	result += SqlBuilderUtil.prepareConditionSql(null, null, columns, null, ", ");
	result += ") values ";
	result += (SqlBuilderUtil.prepareRepeatSql(null, null,
		SqlBuilderUtil.prepareRepeatSql("(", ")", "?", ", ", columns.length), ", ",
		batchSize));

	return result;
}

/**
 * SqlBuilderUtil build update sql
 *
 * @param  {String} tableName table name
 * @param  {Array}  normalColumns normal column names
 * @param  {Array}  primaryColumns primary column names
 * @return {String} sql result
 * @api public
 */
SqlBuilderUtil.buildUpdateSql = function(tableName, normalColumns, primaryColumns) {
	var result = "";

	result += "update ";
	result += tableName;
	result += " set ";
	result += SqlBuilderUtil.prepareConditionSql(null, null, normalColumns, " = ?", ",");
	result += " where ";
	result += SqlBuilderUtil.prepareConditionSql(null, null, primaryColumns, " = ?", " and ");

	return result;
}

/**
 * SqlBuilderUtil build select prefix
 *
 * @param  {String} tableName table name
 * @param  {Array}  columns column names
 * @return {String} select prefix
 * @api private
 */
SqlBuilderUtil.buildSelectPrefix = function(tableName, columns) {
	var result = "";
	result += "select ";
	if (!columns || !columns.length) {
		result += "*";
	} else {
		result += SqlBuilderUtil.prepareConditionSql(null, null, columns, null, ",");
	}
	result += " from ";
	result += tableName;
	result += " where ";

	return result;
}

/**
 * SqlBuilderUtil build select sql
 *
 * @param  {String} tableName table name
 * @param  {Array}  columns column names
 * @param  {Array}  primaryColumns primary column names
 * @param  {Number} quantity quantity number
 * @return {String} sql result
 * @api public
 */
SqlBuilderUtil.buildSelectSql = function(tableName, columns, primaryColumns, quantity) {
	if (!quantity) {
		quantity = 1;
	}

	var result = "";
	result += SqlBuilderUtil.buildSelectPrefix(tableName, columns);

	for (var i = 0; i < quantity; i++) {
		result += "(";
		result += SqlBuilderUtil.prepareConditionSql(null, null, primaryColumns, " = ?", " and ");
		result += ")";
		if (i < (quantity - 1)) {
			result += " or ";
		}
	}

	return result;
}

/**
 * SqlBuilderUtil build delete sql
 *
 * @param  {String} tableName table name
 * @param  {Array}  columns column names
 * @return {String} sql result
 * @api public
 */
SqlBuilderUtil.buildDeleteSql = function(tableName, columns) {
	return SqlBuilderUtil.buildBatchDeleteSql(tableName, columns, 1);
}

/**
 * SqlBuilderUtil build insert sql
 *
 * @param  {String} tableName table name
 * @param  {Array}  columns column names
 * @param  {Number} batchSize batch size
 * @return {String} sql result
 * @api private
 */
SqlBuilderUtil.buildBatchDeleteSql = function(tableName, columns, batchSize) {
	var result = "";

	result += "delete from ";
	result += tableName;
	result += " where ";
	result += (SqlBuilderUtil.prepareRepeatSql(null, null,
		SqlBuilderUtil.prepareConditionSql("(", ")", columns, " = ?", " and "),
		" or ", batchSize));

	return result;
}

/**
 * SqlBuilderUtil append order to sql
 *
 * @param  {String} sql
 * @param  {String} orderColumn order column
 * @return {String} isAsc sql result
 * @api private
 */
SqlBuilderUtil.appendOrder = function(sql, orderColumn, isAsc) {
	var result = "";

	if (orderColumn != null) {
		result += (" order by ");
		result += (orderColumn);
	}
	if (isAsc != null) {
		if (isAsc) {
			result += (" asc");
		} else {
			result += (" desc");
		}
	}

	return sql + result;
}

/**
 * SqlBuilderUtil append limit to sql
 *
 * @param  {String} sql
 * @param  {Number} limit limit number
 * @param  {Number} offset offset number
 * @return {String} sql result
 * @api private
 */
SqlBuilderUtil.appendLimit = function(sql, limit, offset) {
	var result = "";

	if (limit > 0) {
		result += (" limit ");
		result += (limit);
	}
	if (offset > 0) {
		result += (" offset ");
		result += (offset);
	}
	return sql + result;
}

/**
 * SqlBuilderUtil prepare condition to sql
 *
 * @param  {String} prefix
 * @param  {String} suffix
 * @param  {Array}  columns
 * @param  {String} extra
 * @param  {String} join
 * @return {String} condition sql
 * @api private
 */
SqlBuilderUtil.prepareConditionSql = function(prefix, suffix, columns, extra, join) {
	var result = "";
	if (prefix) {
		result += prefix;
	}

	for (var i = 0; i < columns.length; i++) {
		if (i > 0) {
			result += join;
		}
		result += columns[i];
		if (extra) {
			result += extra;
		}
	}

	if (suffix) {
		result += suffix;
	}

	return result;
}

/**
 * SqlBuilderUtil prepare repeat to sql
 *
 * @param  {String} prefix
 * @param  {String} suffix
 * @param  {Number} repeat repeat number
 * @param  {String} join
 * @param  {Number} times times number
 * @return {String} repeat sql result
 * @api private
 */
SqlBuilderUtil.prepareRepeatSql = function(prefix, suffix, repeat, join, times) {
	var result = "";
	if (prefix) {
		result += prefix;
	}

	for (var i = 0; i < times; i++) {
		if (i > 0) {
			result += join;
		}
		result += repeat;
	}

	if (suffix) {
		result += suffix;
	}

	return result;
}

/**
 * SqlBuilderUtil get sql
 *
 * @param  {String} sql with $ prefix or real sql
 * @return {String} real sql
 * @api private
 */
SqlBuilderUtil.getSql = function(sql) {
	if (!Utils.checkString(sql)) {
		return;
	}

	var prefix = sql[0];
	var r = sql;

	if (prefix === Constant.DOLLAR_PREFIX) {
		var sqlId = sql.substr(1);
		r = BearcatDao.getSQL(sqlId);
	}

	return r;
}