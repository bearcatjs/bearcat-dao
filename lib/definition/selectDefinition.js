/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao SelectDefinition
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var ConditionDefinition = require('./expression/conditionDefinition');
var ColumnDefinition = require('./expression/columnDefinition');
var TableDefinition = require('./tableDefinition');
var SqlDefinition = require('./sqlDefinition');
var Constant = require('../util/constant');
var Util = require('util');

var SelectDefinition = function() {
	SqlDefinition.call(this);
	this.type = "select";
	this.originalSQL = null;
	this.sql = null;
	this.tableList = [];
	this.columnList = [];
	this.conditionList = [];
	this.having = null;
	this.orderList = [];
	this.hasOriginalGroupBy = false;
	this.groupList = [];
	this.hasAggColumn = false;
	this.hasAggDistinct = false;
	this.aggDistinctIndex = -1;
	this.limit = null;
	this.offset = null;
	this.isForUpdate = false;
	this.multiDDBQuery = false;
	this.hasFromClause = false;
	this.fakeGroupbyIndex = -1;
	this.manualAddGroupByCount = 0;
	this.pushDownSorting = false;
	this.orderByAgg = false;
	this.needJoin = false;
	this.isDistinct = false;
	this.groupOrderList = [];
}

Util.inherits(SelectDefinition, SqlDefinition);

SelectDefinition.prototype.init = function() {
	var sqlMeta = this.sqlMeta;
	console.log(sqlMeta)
	var meta = sqlMeta[0];

	for (var key in meta) {
		var value = meta[key];
		this.doInit(key, value);
	}
}

SelectDefinition.prototype.doInit = function(key, value) {
	if (key === Constant.SQL_SELECT_PART.COLUMN) {
		return this.doInitColumn(value);
	}

	if (key === Constant.SQL_SELECT_PART.SOURCE) {
		return this.doInitSource(value);
	}

	if (key === Constant.SQL_SELECT_PART.WHERE) {
		return this.doInitWhere(value);
	}

	if (key === Constant.SQL_SELECT_PART.LIMIT) {
		return this.doInitLimit(value);
	}
}

SelectDefinition.prototype.doInitColumn = function(column) {
	console.log('doInitColumn %j', column);

	for (var columnKey in column) {
		var columnValue = column[columnKey];

		this.addColumn(columnKey, columnValue)
	}
}

SelectDefinition.prototype.doInitSource = function(source) {
	this.hasFromClause = true;
	for (var sourceKey in source) {
		var sourceValue = source[sourceKey];
		var sourceType = sourceValue['type'];
		var sourceTable = sourceValue['source'];
		this.addTable(sourceKey, sourceTable, sourceType);
	}
}

SelectDefinition.prototype.doInitWhere = function(where) {
	console.log('do init where ~~~~~~~~~~~ %j', where);
	for (var i = 0; i < where.length; i++) {
		var whereItem = where[i];
		this.addWhere(whereItem);
	}
}

SelectDefinition.prototype.doInitLimit = function(limits) {
	console.log('doInitLimit~~~~~~~~~ %j', limits);
	if (limits.length <= 0) {
		return;
	}

	var offset = 0;
	var limit = 0;
	if (limits.length == 1) {
		limit = limits[0]['text'];
	} else if (limits.length > 1) {
		offset = limits[0]['text'];
		limit = limits[1]['text'];
	}

	this.offset = offset;
	this.limit = limit;
}

SelectDefinition.prototype.setDistinct = function(isDistinct) {
	this.isDistinct = isDistinct;
}

SelectDefinition.prototype.checkDistinct = function() {
	return this.isDistinct;
}

SelectDefinition.prototype.addTable = function(alias, table, type) {
	var tableDefinition = new TableDefinition();
	tableDefinition.setName(table);
	tableDefinition.setType(type);
	tableDefinition.setAlias(alias);
	this.tableList.push(tableDefinition);
}

SelectDefinition.prototype.addColumn = function(columnKey, columnValue) {
	var distinct = columnValue['dist'];
	var expression = columnValue['expr'];

	var columnDefinition = new ColumnDefinition();
	var columnName = expression[0]['text'];
	var columnType = expression[0]['type'];

	if (columnType === Constant.LEXTER_TYPE_NUMBER) {
		columnName = parseInt(columnName);
	}

	columnDefinition.setType(columnType);
	columnDefinition.setName(columnName);
	columnDefinition.setAlias(columnKey);

	if (distinct) {
		this.setDistinct(true);
	}

	this.columnList.push(columnDefinition);
}

SelectDefinition.prototype.addWhere = function(where) {
	var column = where['column'];
	var columnName = column['text'];
	var columnType = column['type'];

	var relate = where['relate'];
	var values = where['values'];
	var value = values[0][0];
	var valueName = value['text'];
	var valueType = value['type'];

	var conditionDefinition = new ConditionDefinition();
	conditionDefinition.setName(columnName);
	conditionDefinition.setRelate(relate);
	conditionDefinition.setValue(valueName);

	this.conditionList.push(conditionDefinition);
}

SelectDefinition.prototype.getLimit = function() {
	return this.limit;
}

SelectDefinition.prototype.getOffset = function() {
	return this.offset;
}

SelectDefinition.prototype.isOrderByAgg = function() {
	return this.orderByAgg;
}

SelectDefinition.prototype.getOrderList = function() {
	return this.orderList;
}

SelectDefinition.prototype.getColumns = function() {
	return this.columnList;
}

SelectDefinition.prototype.isJoinNeeded = function() {
	return this.needJoin;
}

SelectDefinition.prototype.groupContainsBalanceField = function() {

}

SelectDefinition.prototype.setOriginalSQL = function(originalSQL) {
	this.originalSQL = originalSQL;
}

SelectDefinition.prototype.getSQL = function() {
	if (!this.sql) {
		this.sql = this.buildSQL();
	}

	return this.sql;
}

SelectDefinition.prototype.buildSQL = function() {
	var sql = "SELECT ";

	var columnList = this.columnList;

	for (var i = 0; i < columnList.length; i++) {
		var column = columnList[i];
		if (i > 0) {
			sql += ", ";
		}

		sql += column.getSQL();
	}

	if (!this.hasFromClause) {
		return sql;
	}

	sql += " FROM ";

	var tableList = this.tableList;

	for (var i = 0; i < tableList.length; i++) {
		var table = tableList[i];
		if (i > 0) {
			sql += ", ";
		}

		sql += table.getSQL();
	}

	var conditionList = this.conditionList;

	if (conditionList.length) {
		sql += " WHERE ";
	}
	for (var i = 0; i < conditionList.length; i++) {
		var condition = conditionList[i];
		sql += condition.getSQL();
	}

	console.log('buildSQL~~~~~~~~~~~~')
	console.log(this);
	console.log(sql);
	return sql;
}

module.exports = SelectDefinition;