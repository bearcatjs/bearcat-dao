/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao DomainFactory
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var utils = require('./utils');

var DomainFactory = {};

module.exports = DomainFactory;

/**
 * DomainFactory get domain object with domainConfig
 *
 * @param   {Object}  domainConfig
 * @return  {Object}  domain object
 * @api public
 */
DomainFactory.getDomain = function(domainConfig) {
	var func = domainConfig['func'];

	if (utils.checkFunction(func)) {
		return new func();
	}

	return null;
}