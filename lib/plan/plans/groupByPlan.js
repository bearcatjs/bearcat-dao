var QueryPlan = require('./queryPlan');
var Util = require('util');

var GroupByPlan = function() {
	QueryPlan.call(this);
}

Util.inherits(GroupByPlan, QueryPlan);

GroupByPlan.prototype.start = function(cb) {
	var childPlan = this.getChildPlan();

	childPlan.start(cb);
}

module.exports = GroupByPlan;