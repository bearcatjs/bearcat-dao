var QueryPlanPerformer = function(queryPlan) {
	this.queryPlan = queryPlan;
}

QueryPlanPerformer.prototype.executeQuery = function(cb) {
	this.queryPlan.start(cb);
}

module.exports = QueryPlanPerformer;