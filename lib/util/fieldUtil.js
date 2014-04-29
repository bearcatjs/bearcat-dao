/*!
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

var FieldConfig = require('../support/fieldConfig');

var FieldUtil = {};

/**
 * FieldUtil build field config from domain
 *
 * @param   {Array}  list domain array
 * @return  {Array}  field array
 * @api public
 */
FieldUtil.buildFieldConfig = function(list) {
	var r = [];

	if (!list || !Array.isArray(list)) {
		return r;
	}

	for (var i = 0; i < list.length; i++) {
		var w = list[i];

		var fieldConfig = new FieldConfig();

		if (typeof w === 'object') {
			if (w.name) {
				fieldConfig.setName(w.name);
			}

			if (w.type) {
				fieldConfig.setType(w.type);
			}

		}

		if (typeof w === 'string') {
			fieldConfig.setName(w);
		}

		r.push(fieldConfig);
	}

	return r;
}

/**
 * FieldUtil field config array to names array
 *
 * @param   {Array}  field array
 * @return  {Array}  name array
 * @api public
 */
FieldUtil.fieldToNames = function(list) {
	var r = [];

	for (var i = 0; i < list.length; i++) {
		r.push(list[i].getName());
	}

	return r;
}

module.exports = FieldUtil;