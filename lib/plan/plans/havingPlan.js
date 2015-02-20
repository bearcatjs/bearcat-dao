var QueryPlan = require('./queryPlan');
var Util = require('util');

var HavingPlan = function() {
	QueryPlan.call(this);
}

Util.inherits(HavingPlan, QueryPlan);

HavingPlan.prototype.start = function(cb) {
	var childPlan = this.getChildPlan();

	childPlan.start(function(err, results) {
		if (err) {
			return cb(err);
		}

		cb(null, results);
	});
}

module.exports = HavingPlan;