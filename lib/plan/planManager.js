/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao PlanManager
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'PlanManager');
var UpdatePlanPerformer = require('./performers/updatePlanPerformer');
var DirectPlanPerformer = require('./performers/directPlanPerformer');
var QueryPlanPerformer = require('./performers/queryPlanPerformer');
var Constant = require('../util/constant');
var SqlUtil = require('../util/sqlUtil');
var PlanMaker = require('./planMaker');

/**
 * PlanManager constructor function.
 *
 * @api public
 */
var PlanManager = function() {
	this.planMaker = null;
	this.connectionManager = null;
	this.queryPlanPerformer = null;
	this.updatePlanPerformer = null;
	this.directPlanPerformer = null;
}

PlanManager.prototype.directQuery = function(sql, params, options, cb) {
	var planMaker = this.getPlanMaker();
	var planPerformer = this.getDirectPlanPerformer();
	var connectionManager = this.connectionManager;

	var directPlan = planMaker.makeDirectPlan(sql, params, options, connectionManager);
	planPerformer.executeQuery(directPlan, cb);
}

PlanManager.prototype.executeQuery = function(sql, params, cb) {
	return this.parseAndMakePlan(sql, params, cb);
}

PlanManager.prototype.parseAndMakePlan = function(sql, params, cb) {
	var planMaker = this.getPlanMaker();
	var execSQL = SqlUtil.format(sql, params);
	var parsedSQL = SqlUtil.parse(execSQL);

	var sqlType = parsedSQL['type'];
	var sqlResult = parsedSQL['result'];

	// logger.debug("parseAndMakePlan %j", parsedSQL);
	if (!sqlType) {
		return;
	}

	var SqlDefinition = require('../definition/' + sqlType + 'Definition');
	var sqlDefinition = new SqlDefinition();
	sqlDefinition.setOriginalSQL(execSQL);
	sqlDefinition.setSQLMeta(sqlResult);
	sqlDefinition.init();

	var planPerformer = null;
	var connectionManager = this.connectionManager;
	var queryPlan = planMaker.makePlan(sqlDefinition, connectionManager);
	if (sqlType === Constant.PLAN_QUERY) {
		planPerformer = this.getQueryPlanPerformer();
		return planPerformer.executeQuery(queryPlan, cb);
	} else {
		planPerformer = this.getUpdatePlanPerformer();
		return planPerformer.executeUpdate(queryPlan, cb);
	}
}

PlanManager.prototype.getPlanMaker = function() {
	if (!this.planMaker) {
		this.planMaker = new PlanMaker();
	}

	return this.planMaker;
}

PlanManager.prototype.getQueryPlanPerformer = function() {
	if (!this.queryPlanPerformer) {
		this.queryPlanPerformer = new QueryPlanPerformer();
	}

	return this.queryPlanPerformer;
}

PlanManager.prototype.getUpdatePlanPerformer = function() {
	if (!this.updatePlanPerformer) {
		this.updatePlanPerformer = new UpdatePlanPerformer();
	}

	return this.updatePlanPerformer;
}

PlanManager.prototype.getDirectPlanPerformer = function() {
	if (!this.directPlanPerformer) {
		this.directPlanPerformer = new DirectPlanPerformer();
	}

	return this.directPlanPerformer;
}

module.exports = PlanManager;