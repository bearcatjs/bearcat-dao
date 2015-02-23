var Constant = require('../../util/constant');
var QueryPlan = require('./queryPlan');
var Util = require('util');

var OrderByPlan = function(selectDefinition) {
	QueryPlan.call(this);
	this.oldColumns = [];
	this.orderByColumns = [];
	this.init(selectDefinition);
}

Util.inherits(OrderByPlan, QueryPlan);

OrderByPlan.prototype.init = function(selectDefinition) {
	var orderByColumns = selectDefinition.getOrderList();
	var columnList = selectDefinition.getColumns();

	for (var i = 0; i < orderByColumns.length; i++) {
		var orderColumn = orderByColumns[i];

		if (this.containsColumn(columnList, orderColumn)) {
			continue;
		}

		this.addOldColumns(columnList);

		columnList.push(orderColumn); // add orderByColumn to select column list
	}

	this.orderByColumns = orderByColumns;
}

OrderByPlan.prototype.containsColumn = function(columns, orderColumn) {
	for (var i = 0; i < columns.length; i++) {
		var column = columns[i];
		var orderColumnName = orderColumn.getName();
		if (column.getName() === orderColumnName || column.getAlias() === orderColumnName) {
			return true;
		}
	}

	return false;
}

OrderByPlan.prototype.addOldColumns = function(oldColumns) {
	if (!this.oldColumns) {
		this.oldColumns = oldColumns;
	}
}

OrderByPlan.prototype.start = function(cb) {
	var childPlan = this.getChildPlan();
	var orderByColumns = this.orderByColumns;

	var cmp = function(a, b) {
		for (var i = 0; i < orderByColumns.length; i++) {
			var orderColumn = orderByColumns[i];
			var name = orderColumn.getName();
			var type = orderColumn.getType();
			var orderType = orderColumn.getOrderType();

			if (a[name] && b[name]) {
				if (a[name] == b[name]) {
					continue;
				}

				if (orderType === Constant.ORDER_ASC) {
					return a[name] < b[name] ? -1 : 1;
				}

				if (orderType === Constant.ORDER_DESC) {
					return a[name] < b[name] ? 1 : -1;
				}

			}
		}

		return 0;
	}

	childPlan.start(function(err, results) {
		if (err) {
			return cb(err);
		}

		// sort by orderColumns
		if (orderByColumns.length) {
			results = results.sort(cmp);
		}

		return cb(null, results);
	});
}

module.exports = OrderByPlan;