var QueryPlanFactory = require('./queryPlanFactory');
var Constant = require('../util/constant');

var PlanMaker = function() {
	this.queryPlanFactory = new QueryPlanFactory();
}

PlanMaker.prototype.makePlan = function(sqlDefinition, connectionManager) {
	var sqlType = sqlDefinition.getType();

	if (sqlType === Constant.PLAN_QUERY) {
		return this.makeSelectPlan(sqlDefinition, connectionManager);
	} else {
		return this.makeUpdatePlan(sqlDefinition);
	}
}

PlanMaker.prototype.makeSelectPlan = function(selectDefinition, connectionManager) {
	return this.queryPlanFactory.buildQueryPlan(selectDefinition, connectionManager);
}

PlanMaker.prototype.makeUpdatePlan = function(updateDefinition) {

}

PlanMaker.prototype.optimizeQueryPlan = function() {

}

module.exports = PlanMaker;