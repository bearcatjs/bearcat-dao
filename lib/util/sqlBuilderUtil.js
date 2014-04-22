/**
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

var mysql = require('mysql');

var SqlBuilderUtil = {};

module.exports = SqlBuilderUtil;

SqlBuilderUtil.buildInsertSql = function(tableName, columns) {
	return SqlBuilderUtil.buildBatchInsertSql(tableName, columns, 1);
}

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

SqlBuilderUtil.buildDeleteSql = function(tableName, columns) {
	return SqlBuilderUtil.buildBatchDeleteSql(tableName, columns, 1);
}

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