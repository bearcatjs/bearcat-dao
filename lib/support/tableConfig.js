/**
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao TableConfig
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var TableConfig = function() {
	this.func = null;
	this.tableName = null;
	this.normalFields = [];
	this.primaryFields = [];
}

module.exports = TableConfig;

TableConfig.prototype.setTableName = function(tableName) {
	this.tableName = tableName;
}

TableConfig.prototype.getTableName = function() {
	return this.tableName;
}

TableConfig.prototype.setFunc = function(func) {
	this.func = func;
}

TableConfig.prototype.getFunc = function() {
	return this.func;
}

TableConfig.prototype.setPrimaryFields = function(primaryFields) {
	this.primaryFields = primaryFields;
}

TableConfig.prototype.getPrimaryFields = function() {
	return this.primaryFields;
}

TableConfig.prototype.setNormalFields = function(normalFields) {
	this.normalFields = normalFields;
}

TableConfig.prototype.getNormalFields = function() {
	return this.normalFields;
}

TableConfig.prototype.getFields = function() {
	var fields = [];

	for (var i = 0; i < this.normalFields.length; i++) {
		fields.push(this.normalFields[i]);
	}

	for (var i = 0; i < this.primaryFields.length; i++) {
		fields.push(this.primaryFields[i]);
	}

	return fields;
}