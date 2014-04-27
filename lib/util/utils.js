/**
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao Utils
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var Utils = {};

module.exports = Utils;

/**
 * Utils check array
 *
 * @param  {Array}   array
 * @return {Boolean} true|false
 * @api public
 */
Utils.checkArray = function(array) {
	return Object.prototype.toString.call(array) == '[object Array]';
}

/**
 * Utils check function
 *
 * @param  {Function}   function
 * @return {Boolean}    true|false
 * @api public
 */
Utils.checkFunction = function(func) {
	return func && (typeof func === 'function');
}

/**
 * Utils check object
 *
 * @param  {Object}   object
 * @return {Boolean}  true|false
 * @api public
 */
Utils.checkObject = function(obj) {
	return obj && (typeof obj === 'object');
}

/**
 * Utils args to array
 *
 * @param  {Object}  arguments
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