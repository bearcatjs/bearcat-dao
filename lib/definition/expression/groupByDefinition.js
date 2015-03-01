var GroupByDefinition = function() {
	this.name = null;
	this.type = null;
}

GroupByDefinition.prototype.setName = function(name) {
	this.name = name;
}

GroupByDefinition.prototype.getName = function() {
	return this.name;
}

GroupByDefinition.prototype.setType = function(type) {
	this.type = type;
}

GroupByDefinition.prototype.getType = function() {
	return this.type;
}

GroupByDefinition.prototype.getSQL = function() {
	var sql = this.name;

	return sql;
}

module.exports = GroupByDefinition;