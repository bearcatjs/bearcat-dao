var QueryPlan = function() {
	this.childPlan = null;
	this.queryPlanPerformer = null;
}

QueryPlan.prototype.setChildPlan = function(childPlan) {
	this.childPlan = childPlan;
}

QueryPlan.prototype.getChildPlan = function() {
	return this.childPlan;
}

QueryPlan.prototype.appendPlan = function(plan) {
	if (!plan) {
		return this;
	}

	var tmpPlan = this;
	while (tmpPlan.getChildPlan())
		tmpPlan = tmpPlan.getChildPlan();
	tmpPlan.setChildPlan(plan);

	return this;
}

QueryPlan.prototype.optimize = function() {
	var childPlan = this.getChildPlan();

	if (childPlan) {
		childPlan.optimize();

		if (childPlan.deletable()) {
			this.setChildPlan(childPlan.getChildPlan());
		}
	}
}

QueryPlan.prototype.setQueryPlanPerformer = function(queryPlanPerformer) {
	this.queryPlanPerformer = queryPlanPerformer;
}

QueryPlan.prototype.getQueryPlanPerformer = function() {
	this.queryPlanPerformer;
}

QueryPlan.prototype.deletable = function() {
	return false;
}

QueryPlan.prototype.start = function() {

}

module.exports = QueryPlan;