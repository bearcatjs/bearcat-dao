var utils = {};

module.exports = utils;

utils.checkArray = function(array) {
	return Object.prototype.toString.call(array) == '[object Array]';
}

utils.checkFunction = function(func) {
	return func && (typeof func === 'function');
}

utils.checkObject = function(obj) {
	return obj && (typeof obj === 'object');
}

utils.to_array = function(args) {
	var len = args.length;
	var arr = new Array(len);

	for (var i = 0; i < len; i += 1) {
		arr[i] = args[i];
	}

	return arr;
}