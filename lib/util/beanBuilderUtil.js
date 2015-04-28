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

/**
 * BeanBuilderUtil build models from resultset.
 *
 * @param  {String}   model id
 * @param  {Array} 	  result sets
 * @param  {Array}    result model sets
 * @api public
 */
BeanBuilderUtil.buildModels = function(modelId, resultSets) {
	var bearcat = Utils.getBearcat();
	var beanFactory = bearcat.getBeanFactory();
	var modelDefinition = beanFactory.getModelDefinition(modelId);

	var result;
	if (modelDefinition.isOneToMany()) {
		result = {};
		var model = beanFactory.getModelProxy(modelId);
		for (var i = 0; i < resultSets.length; i++) {
			var r = model.$packResultSet(resultSets[i]);
			if (Utils.checkModelFilterError(r)) {
				return r;
			}
		}
		result = model;
	} else {
		result = [];
		for (var i = 0; i < resultSets.length; i++) {
			var model = beanFactory.getModelProxy(modelId);
			var r = model.$packResultSet(resultSets[i]);
			if (Utils.checkModelFilterError(r)) {
				return r;
			}

			result.push(model);
		}
	}

	return result;
}

/**
 * BeanBuilderUtil model set.
 *
 * @param  {Object}   model object
 * @param  {String}   key
 * @param  {String}   value
 * @api public
 */
BeanBuilderUtil.modelSet = function(object, key, value) {
	if (object['model'] && object['model']['$mid']) {
		object.$set(key, value);
	} else {
		object[key] = value;
	}
}

/**
 * BeanBuilderUtil model get.
 *
 * @param  {Object}   model object
 * @param  {String}   key
 * @api public
 */
BeanBuilderUtil.modelGet = function(object, key) {
	var value = object[key];
	if (!Utils.isNotNull(value) && object['$get']) {
		value = object.$get(key);
	}

	return value;
}