var Constant = require('../../util/constant');

var ConditionDefinition = function() {
	this.name = null;
	this.relate = null;
	this.value = null;
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

ConditionDefinition.prototype.setValue = function(value) {
	this.value = value;
}

ConditionDefinition.prototype.getValue = function() {
	return this.value;
}

ConditionDefinition.prototype.getSQL = function() {
	var sql = this.name;
	var relate = Constant.SELECT_CONDITION_RELATE[this.relate];
	sql += (" " + relate + " ");
	sql += this.value;

	return sql;
}

module.exports = ConditionDefinition;