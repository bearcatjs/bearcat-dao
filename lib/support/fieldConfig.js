/**
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

var FieldConfig = function() {
	this.name = null;
	this.type = null;
}

module.exports = FieldConfig;

FieldConfig.prototype.getName = function() {
	return this.name;
}

FieldConfig.prototype.setName = function(name) {
	this.name = name;
}

FieldConfig.prototype.getType = function() {
	return this.type;
}

FieldConfig.prototype.setType = function(type) {
	this.type = type.toLowerCase();
}