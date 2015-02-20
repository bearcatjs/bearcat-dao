var QueryPlan = require('./queryPlan');
var Util = require('util');

var AggregatePlan = function() {
	QueryPlan.call(this);
}

Util.inherits(AggregatePlan, QueryPlan);

AggregatePlan.prototype.start = function(cb) {
	var childPlan = this.getChildPlan();

	childPlan.start(function(err, results) {
		if (err) {
			return cb(err);
		}

		cb(null, results);
	});
}

module.exports = AggregatePlan;