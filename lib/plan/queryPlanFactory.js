/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao QueryPlanFactory
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var AggregatePlan = require('./plans/aggregatePlan');
var OrderByPlan = require('./plans/orderByPlan');
var GroupByPlan = require('./plans/groupByPlan');
var DirectPlan = require('./plans/directPlan');
var SelectPlan = require('./plans/selectPlan');
var HavingPlan = require('./plans/havingPlan');
var LimitPlan = require('./plans/limitPlan');

var QueryPlanFactory = function() {

}

QueryPlanFactory.prototype.buildDirectPlan = function(sql, params, options, connectionManager) {
	return new DirectPlan(sql, params, options, connectionManager);
}

QueryPlanFactory.prototype.buildQueryPlan = function(selectDefinition, connectionManager) {
	var rootPlan = null;

	rootPlan = this.appendPlan(rootPlan, this.buildLimitPlan(selectDefinition));
	rootPlan = this.appendPlan(rootPlan, this.buildOrderByPlan(selectDefinition));

	// if (selectDefinition.isJoinNeeded() || (!selectDefinition.groupContainsBalanceField())) {
	rootPlan = this.appendPlan(rootPlan, this.buildHavingPlan(selectDefinition));
	rootPlan = this.appendPlan(rootPlan, this.buildAggregatePlan(selectDefinition));
	rootPlan = this.appendPlan(rootPlan, this.buildGroupByPlan(selectDefinition));
	// }

	rootPlan = this.appendPlan(rootPlan, this.buildSelectPLan(selectDefinition, connectionManager));
	return rootPlan;
}

QueryPlanFactory.prototype.buildUpdatePlan = function(updateDefinition, connectionManager) {

}

QueryPlanFactory.prototype.buildLimitPlan = function(selectDefinition) {
	return new LimitPlan(selectDefinition);
}

QueryPlanFactory.prototype.buildOrderByPlan = function(selectDefinition) {
	return new OrderByPlan(selectDefinition);
}

QueryPlanFactory.prototype.buildHavingPlan = function(selectDefinition) {
	return new HavingPlan(selectDefinition);
}

QueryPlanFactory.prototype.buildAggregatePlan = function(selectDefinition) {
	return new AggregatePlan(selectDefinition);
}

QueryPlanFactory.prototype.buildGroupByPlan = function(selectDefinition) {
	return new GroupByPlan(selectDefinition);
}

QueryPlanFactory.prototype.buildSelectPLan = function(selectDefinition, connectionManager) {
	return new SelectPlan(selectDefinition, connectionManager);
}

QueryPlanFactory.prototype.appendPlan = function(root, newPlan) {
	if (root) {
		root.appendPlan(newPlan);
	} else {
		root = newPlan;
	}

	return root;
}

module.exports = QueryPlanFactory;