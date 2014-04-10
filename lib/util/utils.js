/**
 * .______    _______     ___      .______       ______     ___   .__________.
 * |   _  )  |   ____)   /   \     |   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * |______)  |_______/__/     \__\ | _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao Utils
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var Utils = {};

module.exports = Utils;

Utils.checkArray = function(array) {
	return Object.prototype.toString.call(array) == '[object Array]';
}

Utils.checkFunction = function(func) {
	return func && (typeof func === 'function');
}

Utils.checkObject = function(obj) {
	return obj && (typeof obj === 'object');
}

Utils.to_array = function(args) {
	var len = args.length;
	var arr = new Array(len);

	for (var i = 0; i < len; i += 1) {
		arr[i] = args[i];
	}

	return arr;
}