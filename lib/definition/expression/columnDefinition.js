var ColumnDefinition = function() {
	this.name = null;
	this.type = null;
	this.alias = null;
	this.distinct = false;
}

ColumnDefinition.prototype.setName = function(name) {
	this.name = name;
}

ColumnDefinition.prototype.getName = function() {
	return this.name;
}

ColumnDefinition.prototype.setType = function(type) {
	this.type = type;
}

ColumnDefinition.prototype.getType = function() {
	return this.type;
}

ColumnDefinition.prototype.setAlias = function(alias) {
	this.alias = alias;
}

ColumnDefinition.prototype.getAlias = function() {
	return this.alias;
}

ColumnDefinition.prototype.setDistinct = function(distinct) {
	this.distinct = distinct;
}

ColumnDefinition.prototype.isDistinct = function() {
	return this.distinct;
}

ColumnDefinition.prototype.getSQL = function() {
	var sql = this.name;

	if (this.alias && this.name != this.alias) {
		sql = sql + " AS " + this.alias;
	}

	return sql;
}

module.exports = ColumnDefinition;