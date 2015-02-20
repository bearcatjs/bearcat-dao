var TableDefinition = function() {
	this.name = null;
	this.type = null;
	this.alias = null;
}

TableDefinition.prototype.setName = function(name) {
	this.name = name;
}

TableDefinition.prototype.getName = function() {
	return this.name;
}

TableDefinition.prototype.setType = function(type) {
	this.type = type;
}

TableDefinition.prototype.getType = function() {
	return this.type;
}

TableDefinition.prototype.setAlias = function(alias) {
	this.alias = alias;
}

TableDefinition.prototype.getAlias = function() {
	return this.alias;
}

TableDefinition.prototype.getSQL = function() {
	var sql = this.name;

	if (this.alias && this.name != this.alias) {
		sql = sql + " AS " + this.alias;
	}

	return sql;
}

module.exports = TableDefinition;