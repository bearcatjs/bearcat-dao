/**
 * .______    _______     ___      .______       ______     ___   .__________.
 * |   _  )  |   ____)   /   \     |   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * |______)  |_______/__/     \__\ | _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao BeanBuilderUtil
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var BeanBuilderUtil = {};

module.exports = BeanBuilderUtil;

BeanBuilderUtil.buildObjectList = function(results, func, fields) {
	var r = [];

	for (var i = 0; i < results.length; i++) {
		var result = results[i];
		var beanObject = new func();

		for (var j = 0; j < fields.length; j++) {
			var field = fields[j];
			var name = field.getName();
			if (result[name]) {
				beanObject[name] = result[name];
			}
		}

		r.push(beanObject);
	}

	return r;
}