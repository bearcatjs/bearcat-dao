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
var QueryPlanPerformer = require('./performers/queryPlanPerformer');
var Constant = require('../util/constant');
var SqlUtil = require('../util/sqlUtil');
var PlanMaker = require('./planMaker');

var PlanManager = function() {
	this.planMaker = new PlanMaker();
	this.connectionManager = null;
}

PlanManager.prototype.executeQuery = function(sql, params, cb) {
	return this.parseAndMakePlan(sql, params, cb);
}

PlanManager.prototype.parseAndMakePlan = function(sql, params, cb) {
	var planMaker = this.planMaker;
	var execSQL = SqlUtil.format(sql, params);
	var parsedSQL = SqlUtil.parse(execSQL);

	var sqlType = parsedSQL['type'];
	var sqlResult = parsedSQL['result'];

	logger.debug("parseAndMakePlan %j", parsedSQL)

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
	if (sqlType === Constant.PLAN_QUERY) {
		planPerformer = new QueryPlanPerformer(planMaker.makePlan(sqlDefinition, connectionManager));
		return planPerformer.executeQuery(cb);
	} else {
		planPerformer = new UpdatePlanPerformer(planMaker.makePlan(sqlDefinition, connectionManager));
		return planPerformer.executeUpdate(cb);
	}
}

module.exports = PlanManager;