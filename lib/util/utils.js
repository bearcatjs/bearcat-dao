/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao Utils
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var crc = require('redis-crc');
var Utils = {};
var bearcat;

/**
 * Utils check type
 *
 * @param  {String}   type
 * @return {Function} high order function
 * @api public
 */
Utils.isType = function(type) {
	return function(obj) {
		return {}.toString.call(obj) == "[object " + type + "]";
	}
}

/**
 * Utils check array
 *
 * @param  {Array}   array
 * @return {Boolean} true|false
 * @api public
 */
Utils.checkArray = Array.isArray || Utils.isType("Array");

/**
 * Utils check number
 *
 * @param  {Number}  number
 * @return {Boolean} true|false
 * @api public
 */
Utils.checkNumber = Utils.isType("Number");

/**
 * Utils check function
 *
 * @param  {Function}   func function
 * @return {Boolean}    true|false
 * @api public
 */
Utils.checkFunction = Utils.isType("Function");
/**
 * Utils check object
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
Utils.checkObject = Utils.isType("Object");

/**
 * Utils check string
 *
 * @param  {String}   string
 * @return {Boolean}  true|false
 * @api public
 */
Utils.checkString = Utils.isType("String");

/**
 * Utils check boolean
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
Utils.checkBoolean = Utils.isType("Boolean");

/**
 * Utils args to array
 *
 * @param  {Object}  args arguments
 * @return {Array}   array
 * @api public
 */
Utils.to_array = function(args) {
	var len = args.length;
	var arr = new Array(len);

	for (var i = 0; i < len; i++) {
		arr[i] = args[i];
	}

	return arr;
}

/**
 * Utils check is not null
 *
 * @param  {Object}   value
 * @return {Boolean}  true|false
 * @api public
 */
Utils.isNotNull = function(value) {
	if (value !== null && typeof value !== 'undefined')
		return true;
	return false;
}

Utils.getBearcat = function() {
	if (bearcat) {
		return bearcat;
	}

	try {
		bearcat = require('bearcat');
	} catch (e) {
		console.error(e);
	}
	return bearcat;
}

/**
 * Utils check model filter error
 *
 * @return {Boolean}  true|false
 * @api public
 */
Utils.checkModelFilterError = function(r) {
	return r !== true && this.isNotNull(r);
}

/**
 * Utils calculate hash value
 *
 * @param  {String}  hash key
 * @param  {Number}  num
 * @return {String}  hash value
 * @api public
 */
Utils.calHashValue = function(key, num) {
	var value = crc.keyHashSlot(key, key.length, num);
	return value;
}

module.exports = Utils;