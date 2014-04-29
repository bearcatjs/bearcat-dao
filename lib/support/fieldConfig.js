/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao FieldConfig
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

/**
 * FieldConfig constructor function.
 *
 * @api public
 */
var FieldConfig = function() {
	this.name = null;
	this.type = null;
}

module.exports = FieldConfig;

/**
 * FieldConfig get name.
 *
 * @return  {String} field name
 * @api public
 */
FieldConfig.prototype.getName = function() {
	return this.name;
}

/**
 * FieldConfig set name.
 *
 * @param  {String} name field name
 * @api public
 */
FieldConfig.prototype.setName = function(name) {
	this.name = name;
}

/**
 * FieldConfig get type.
 *
 * @return  {String} field type
 * @api public
 */
FieldConfig.prototype.getType = function() {
	return this.type;
}

/**
 * FieldConfig get type.
 *
 * @param  {String} type type name
 * @api public
 */
FieldConfig.prototype.setType = function(type) {
	this.type = type.toLowerCase();
}