/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao PlanMaker
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

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

PlanMaker.prototype.makeUpdatePlan = function(updateDefinition, connectionManager) {
	return this.queryPlanFactory.buildUpdatePlan(updateDefinition, connectionManager);
}

PlanMaker.prototype.makeDirectPlan = function(sql, params, options, connectionManager) {
	return this.queryPlanFactory.buildDirectPlan(sql, params, options, connectionManager);
}

PlanMaker.prototype.optimizeQueryPlan = function() {

}

module.exports = PlanMaker;