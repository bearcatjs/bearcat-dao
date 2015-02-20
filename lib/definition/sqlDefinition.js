var SqlDefinition = function() {
	this.type = "sql";
	this.sqlMeta = null;
}

SqlDefinition.prototype.setSQLMeta = function(sqlMeta) {
	this.sqlMeta = sqlMeta;
}

SqlDefinition.prototype.getType = function() {
	return this.type;
}

module.exports = SqlDefinition;