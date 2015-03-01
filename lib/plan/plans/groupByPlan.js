var QueryPlan = require('./queryPlan');
var Util = require('util');

var GroupByPlan = function(selectDefinition) {
	QueryPlan.call(this);
	this.oldColumns = [];
	this.groupByColumns = [];
	this.init(selectDefinition);
}

Util.inherits(GroupByPlan, QueryPlan);

GroupByPlan.prototype.init = function(selectDefinition) {
	var groupByColumns = selectDefinition.getGroupList();
	var columnList = selectDefinition.getColumns();

	for (var i = 0; i < groupByColumns.length; i++) {
		var groupColumn = groupByColumns[i];

		if (this.containsColumn(columnList, groupColumn)) {
			continue;
		}

		this.addOldColumns(columnList);

		columnList.push(groupColumn); // add groupByColumn to select column list
	}

	this.groupByColumns = groupByColumns;
}

GroupByPlan.prototype.containsColumn = function(columns, groupColumn) {
	for (var i = 0; i < columns.length; i++) {
		var column = columns[i];
		var groupColumnName = groupColumn.getName();
		if (column.getName() === groupColumnName || column.getAlias() === groupColumnName) {
			return true;
		}
	}

	return false;
}

GroupByPlan.prototype.addOldColumns = function(oldColumns) {
	if (!this.oldColumns) {
		this.oldColumns = oldColumns;
	}
}

GroupByPlan.prototype.start = function(cb) {
	var childPlan = this.getChildPlan();

	var groupByColumns = this.groupByColumns;
	var groupByMap = {};

	childPlan.start(function(err, results) {
		if (err) {
			return cb(err);
		}

		var r = [];

		for (var i = 0; i < results.length; i++) {
			var result = results[i];

			var flag = true;
			for (var j = 0; j < groupByColumns.length; j++) {
				var groupColumn = groupByColumns[j];
				var groupName = groupColumn.getName();
				var resultValue = result[groupName];

				if (!resultValue) {
					continue;
				}

				if (!groupByMap[groupName]) {
					groupByMap[groupName] = {};
				}

				if (!groupByMap[groupName][resultValue]) {
					groupByMap[groupName][resultValue] = true;
				} else {
					flag = false;
					break;
				}
			}

			if (flag) {
				r.push(result);
			}
		}

		cb(null, r);
	});
}

module.exports = GroupByPlan;