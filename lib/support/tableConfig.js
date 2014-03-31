var tableConfig = function() {
	this.tableName = null;
	this.func = null;
	this.primaryFields = [];
	this.normalFields = [];
}

module.exports = tableConfig;

tableConfig.prototype.setTableName = function(tableName) {
	this.tableName = tableName;
}

tableConfig.prototype.getTableName = function() {
	return this.tableName;
}

tableConfig.prototype.setFunc = function(func) {
	this.func = func;
}

tableConfig.prototype.getFunc = function() {
	return this.func;
}

tableConfig.prototype.setPrimaryFields = function(primaryFields) {
	this.primaryFields = primaryFields;
}

tableConfig.prototype.getPrimaryFields = function() {
	return this.primaryFields;
}

tableConfig.prototype.setNormalFields = function(normalFields) {
	this.normalFields = normalFields;
}

tableConfig.prototype.getNormalFields = function() {
	return this.normalFields;
}

tableConfig.prototype.getFields = function() {
	var fields = [];

	for (var i = 0; i < this.normalFields.length; i++) {
		fields.push(this.normalFields[i]);
	}

	for (var i = 0; i < this.primaryFields.length; i++) {
		fields.push(this.primaryFields[i]);
	}

	return fields;
}