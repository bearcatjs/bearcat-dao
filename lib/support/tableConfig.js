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

/**
 * TableConfig constructor function.
 *
 * @api public
 */
var TableConfig = function() {
	this.func = null;
	this.tableName = null;
	this.normalFields = [];
	this.primaryFields = [];
}

module.exports = TableConfig;

/**
 * TableConfig set table name.
 *
 * @param  {String} table name
 * @api public
 */
TableConfig.prototype.setTableName = function(tableName) {
	this.tableName = tableName;
}

/**
 * TableConfig get table name.
 *
 * @return  {String} table name
 * @api public
 */
TableConfig.prototype.getTableName = function() {
	return this.tableName;
}

/**
 * TableConfig set constructor function.
 *
 * @param  {Function} constructor function
 * @api public
 */
TableConfig.prototype.setFunc = function(func) {
	this.func = func;
}

/**
 * TableConfig get constructor function.
 *
 * @return  {Function} constructor function
 * @api public
 */
TableConfig.prototype.getFunc = function() {
	return this.func;
}

/**
 * TableConfig set primary fields.
 *
 * @param  {Array} primary fields
 * @api public
 */
TableConfig.prototype.setPrimaryFields = function(primaryFields) {
	this.primaryFields = primaryFields;
}

/**
 * TableConfig get primary fields.
 *
 * @return  {Array} primary fields
 * @api public
 */
TableConfig.prototype.getPrimaryFields = function() {
	return this.primaryFields;
}

/**
 * TableConfig set normal fields.
 *
 * @param  {Array} normal fields
 * @api public
 */
TableConfig.prototype.setNormalFields = function(normalFields) {
	this.normalFields = normalFields;
}

/**
 * TableConfig get primary fields.
 *
 * @return  {Array} primary fields
 * @api public
 */
TableConfig.prototype.getNormalFields = function() {
	return this.normalFields;
}

/**
 * TableConfig get fields(all).
 *
 * @param  {Array} fields
 * @api public
 */
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