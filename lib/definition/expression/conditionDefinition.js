var Constant = require('../../util/constant');
var SqlUtil = require('../../util/sqlUtil');

var ConditionDefinition = function() {
	this.name = null;
	this.relate = null;
	this.values = null;
}

ConditionDefinition.prototype.setName = function(name) {
	this.name = name;
}

ConditionDefinition.prototype.getName = function() {
	return this.name;
}

ConditionDefinition.prototype.setRelate = function(relate) {
	this.relate = relate;
}

ConditionDefinition.prototype.getRelate = function() {
	return this.relate;
}

ConditionDefinition.prototype.setValues = function(values) {
	this.values = values;
}

ConditionDefinition.prototype.getValues = function() {
	return this.values;
}

ConditionDefinition.prototype.getSQL = function() {
	var sql = this.name;
	var relate = SqlUtil.getRelate(this.relate);

	if (relate === Constant.SELECT_CONDITION_NOT_NULL) {
		sql += (" is " + relate);
		return sql;
	}

	sql += (" " + relate + " ");

	sql += this.getSQLValue(relate);

	return sql;
}

ConditionDefinition.prototype.getSQLValue = function(relate) {
	var values = this.values;
	var sqlValue = "";

	if (!values) {
		return sqlValue;
	}

	var len = values.length;

	if (relate === Constant.SELECT_CONDITION_IN || relate === Constant.SELECT_CONDITION_NOT_IN) {
		sqlValue += "(";

		for (var i = 0; i < len; i++) {
			var value = values[i][0];
			sqlValue += this.getConditionValue(value);
			if (i < len - 1) {
				sqlValue += ",";
			} else {
				sqlValue += ")";
			}
		}
	} else if (relate === Constant.SELECT_CONDITION_BETWEEN) {
		var from = values[0][0];
		var to = values[1][0];
		sqlValue += (this.getConditionValue(from) + " AND " + this.getConditionValue(to));
	} else {
		len = values[0].length;
		for (var i = 0; i < len; i++) {
			var value = values[0][i];
			if (i == len - 1) {
				sqlValue += " ";
			}
			sqlValue += this.getConditionValue(value);
		}
	}

	return sqlValue;
}

ConditionDefinition.prototype.getConditionValue = function(value) {
	var sql = "";
	var text = value['text'];
	var type = value['type'];

	if (type === Constant.SELECT_CONDITION_VALUE_TYPE_STRING) {
		sql += ('\"' + text + '\"');
	} else if (type === Constant.SELECT_CONDITION_VALUE_TYPE_KEYWORD || type === Constant.SELECT_CONDITION_VALUE_TYPE_OPERATOR) {
		sql += (' ' + text);
	} else {
		sql = text;
	}

	return sql;
}

module.exports = ConditionDefinition;