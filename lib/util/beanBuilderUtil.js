/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao BeanBuilderUtil
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var Utils = require('./utils');
var BeanBuilderUtil = {};

module.exports = BeanBuilderUtil;

/**
 * BeanBuilderUtil build object list from resultset.
 *
 * @param  {Array}    results query resultset
 * @param  {Function} func constructor function
 * @param  {Array}    fields fields array
 * @api public
 */
BeanBuilderUtil.buildObjectList = function(results, func, fields) {
	var r = [];

	for (var i = 0; i < results.length; i++) {
		var result = results[i];
		var beanObject = new func();

		for (var j = 0; j < fields.length; j++) {
			var field = fields[j];
			var name = field.getName();
			if (Utils.isNotNull(result[name])) {
				beanObject[name] = result[name];
			}
		}

		r.push(beanObject);
	}

	return r;
}