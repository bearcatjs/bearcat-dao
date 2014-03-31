var beanBuilderUtil = {};

module.exports = beanBuilderUtil;

beanBuilderUtil.buildObjectList = function(results, func, fields) {
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