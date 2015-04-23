var QueryPlanPerformer = function() {}

QueryPlanPerformer.prototype.executeQuery = function(queryPlan, cb) {
	queryPlan.start(cb);
}

module.exports = QueryPlanPerformer;