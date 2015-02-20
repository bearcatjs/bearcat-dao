var QueryPlan = require('./queryPlan');
var Util = require('util');

var OrderByPlan = function(selectDefinition) {
	QueryPlan.call(this);
	this.orderByColumns = [];
	this.oldColumns = [];
	this.init(selectDefinition);
}

Util.inherits(OrderByPlan, QueryPlan);

OrderByPlan.prototype.init = function(selectDefinition) {
	var orderByColumns = selectDefinition.getOrderList();
	var columnList = selectDefinition.getColumns();

	for (var i = 0; i < orderByColumns.length; i++) {
		var orderColumn = orderByColumns[i];

		if (this.containsColumn(columnList, columnName)) {
			continue;
		}

		this.addOldColumns(columnList);

		columnList.push(orderColumn); // add orderByColumn to select column list
	}

	this.orderByColumns = orderByColumns;
}

OrderByPlan.prototype.containsColumn = function(columns, columnName) {
	for (var i = 0; i < columns.length; i++) {
		if (columns[i] === columnName) {
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

	childPlan.start(function(err, results) {
		if (err) {
			return cb(err);
		}

		// TODO sort by orderColumns
		return cb(null, results);
	});
}

module.exports = OrderByPlan;