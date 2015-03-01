var logger = require('pomelo-logger').getLogger('bearcat-dao', 'LimitPlan');
var Utils = require('../../util/utils');
var QueryPlan = require('./queryPlan');
var Util = require('util');

var LimitPlan = function(selectDefinition) {
	QueryPlan.call(this);
	this.limit = selectDefinition.getLimit();
	this.offset = selectDefinition.getOffset();
	this.orderByAgg = selectDefinition.isOrderByAgg();
}

Util.inherits(LimitPlan, QueryPlan);

LimitPlan.prototype.start = function(cb) {
	var offset = this.offset;
	var limit = this.limit;

	var childPlan = this.getChildPlan();
	childPlan.start(function(err, results) {
		if (err) {
			return cb(err);
		}

		if (!Utils.isNotNull(offset)) {
			return cb(null, results);
		}

		var r = [];
		var len = results.length;
		var end = len;
		if (Utils.isNotNull(limit)) {
			end = offset + limit;
		}

		if (end > len) {
			end = len;
		}

		logger.debug('start %d %d', offset, end);
		for (var i = offset; i < end; i++) {
			r.push(results[i]);
		}

		cb(null, r);
	});
}

LimitPlan.prototype.disableCurrentNode = function() {
	var queryPlanPerformer = this.getQueryPlanPerformer();

	if (queryPlanPerformer.isSingleNode() && !queryPlanPerformer.hasJoin() && !this.orderByAgg) {
		return true;
	}

	return false;
}

module.exports = LimitPlan;