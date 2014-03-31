var utils = require('./utils');

var domainFactory = {};

module.exports = domainFactory;

domainFactory.getDomain = function(domainConfig) {
	var func = domainConfig['func'];

	if (utils.checkFunction(func)) {
		return new func();
	}

	return null;
}