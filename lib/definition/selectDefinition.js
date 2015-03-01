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
var OrderByDefinition = require('./expression/orderByDefinition');
var GroupByDefinition = require('./expression/groupByDefinition');
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
	this.selectRole = Constant.ROLE_MASTER;
}

Util.inherits(SelectDefinition, SqlDefinition);

SelectDefinition.prototype.init = function() {
	var sqlMeta = this.sqlMeta;

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

	if (key === Constant.SQL_SELECT_PART.ORDERBY) {
		return this.doInitOrderBy(value);
	}

	if (key === Constant.SQL_SELECT_PART.GROUPBY) {
		return this.doInitGroupBy(value);
	}
}

SelectDefinition.prototype.doInitColumn = function(column) {
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
	for (var i = 0; i < where.length; i++) {
		var whereItem = where[i];
		this.addWhere(whereItem);
	}
}

SelectDefinition.prototype.doInitLimit = function(limits) {
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

SelectDefinition.prototype.doInitOrderBy = function(orders) {
	for (var i = 0; i < orders.length; i++) {
		var orderItem = orders[i];
		this.addOrder(orderItem);
	}
}

SelectDefinition.prototype.doInitGroupBy = function(groups) {
	for (var i = 0; i < groups.length; i++) {
		var groupItem = groups[i];
		this.addGroup(groupItem);
	}
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

	var conditionDefinition = new ConditionDefinition();
	conditionDefinition.setName(columnName);
	conditionDefinition.setRelate(relate);
	conditionDefinition.setValues(values);

	this.conditionList.push(conditionDefinition);
}

SelectDefinition.prototype.addOrder = function(order) {
	var orderType = order['type'];
	var value = order['expr'][0];
	var name = value['text'];
	var type = value['type'];

	var orderByDefinition = new OrderByDefinition();
	orderByDefinition.setName(name);
	orderByDefinition.setType(type);
	orderByDefinition.setOrderType(orderType);

	this.orderList.push(orderByDefinition);
}

SelectDefinition.prototype.addGroup = function(group) {
	var groupByDefinition = new GroupByDefinition();
	var name = group[0]['text'];
	var type = group[0]['type'];
	groupByDefinition.setName(name);
	groupByDefinition.setType(type);

	this.groupList.push(groupByDefinition);
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

SelectDefinition.prototype.getGroupList = function() {
	return this.groupList;
}

SelectDefinition.prototype.getColumns = function() {
	return this.columnList;
}

SelectDefinition.prototype.isJoinNeeded = function() {
	return this.needJoin;
}

SelectDefinition.prototype.groupContainsBalanceField = function() {

}

SelectDefinition.prototype.getTableList = function() {
	return this.tableList;
}

SelectDefinition.prototype.getConditionList = function() {
	return this.conditionList;
}

SelectDefinition.prototype.setSelectRole = function(selectRole) {
	this.selectRole = selectRole;
}

SelectDefinition.prototype.getSelectRole = function() {
	return this.selectRole;
}

SelectDefinition.prototype.setOriginalSQL = function(originalSQL) {
	this.originalSQL = originalSQL;
}

SelectDefinition.prototype.getOriginalSQL = function() {
	return this.originalSQL;
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
		if (i < conditionList.length - 1) {
			sql += " AND ";
		}
	}

	var groupList = this.groupList;

	if (groupList.length) {
		sql += " GROUP BY "
	}

	for (var i = 0; i < groupList.length; i++) {
		var group = groupList[i];
		sql += group.getSQL();

		if (i < groupList.length - 1) {
			sql += " , ";
		}
	}

	return sql;
}

module.exports = SelectDefinition;