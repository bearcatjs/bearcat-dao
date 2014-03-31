var FieldConfig = require('../support/fieldConfig');

var fieldUtil = {};

fieldUtil.buildFieldConfig = function(list) {
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

fieldUtil.fieldToNames = function(list) {
	var r = [];

	for (var i = 0; i < list.length; i++) {
		r.push(list[i].getName());
	}

	return r;
}

module.exports = fieldUtil;