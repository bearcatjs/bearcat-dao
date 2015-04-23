/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao DirectPlan
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'DirectPlan');
var Constant = require('../../util/constant');
var PlanHelper = require('../planHelper');
var QueryPlan = require('./queryPlan');
var async = require('async');
var Util = require('util');

var DirectPlan = function(sql, params, options, connectionManager) {
	QueryPlan.call(this);
	this.sql = sql;
	this.params = params || [];
	this.options = options || {};
	this.connectionManager = connectionManager;
}

Util.inherits(DirectPlan, QueryPlan);

DirectPlan.prototype.start = function(cb) {
	var sql = this.sql;
	var params = this.params;
	var options = this.options;
	var queryTimeout = options.timeout;
	var destDB = options.destDB || Constant.DEST_DB_ALL;
	var connectionManager = this.connectionManager;

	var self = this;

	var role = options.role || Constant.ROLE_MASTER;

	if (destDB == Constant.DEST_DB_ALL) {
		destDB = PlanHelper.getDestDB(destDB);
	}

	logger.debug('sql %s query options %j destDB %j', sql, options, destDB);

	var result = [];

	async.each(destDB, function(destNode, next) {
		connectionManager.getConnection(destNode, role, function(err, connection) {
			if (err) {
				return next(err);
			}

			var timerId = null;
			var timeoutFlag = false;
			if (queryTimeout) {
				timerId = setTimeout(function() {
					next();
					timeoutFlag = true;
					logger.error('query sql %s %j timeout', sql, params);
				}, queryTimeout);
			}

			var query = connection.query(sql, params, function(err, results) {
				connectionManager.release(connection);
				if (timeoutFlag) {
					return;
				}

				clearTimeout(timerId);
				if (err) {
					return next(err);
				}

				result = result.concat(results);
				next();
			});

			self.print(query.sql);
		});

	}, function(err) {
		cb(err, result);
	});
}

DirectPlan.prototype.print = function(sql) {
	if (process.env.BEARCAT_DEBUG) {
		logger.debug(sql);
	}
}

module.exports = DirectPlan;