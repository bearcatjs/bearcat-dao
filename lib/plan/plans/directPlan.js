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
	var connectionManager = this.connectionManager;
	var options = this.options;
	var destDB = options.destDB || Constant.DEST_DB_ALL;
	var queryTimeout = options.timeout;
	var sql = this.sql;
	var params = this.params;

	var self = this;

	logger.debug('options %j %s', options, destDB);
	var role = options.role || Constant.ROLE_MASTER;

	if (destDB == Constant.DEST_DB_ALL) {
		destDB = PlanHelper.getDestDB(destDB);
	}

	var r = [];
	logger.debug("destDB %j sql %s", destDB, sql);

	async.each(destDB, function(destNode, next) {
		connectionManager.getConnection(destNode, role, function(err, connection) {
			if (err) {
				return next(err);
			}

			var timerId = null;
			var timeoutFlag = 0;
			if (queryTimeout) {
				timerId = setTimeout(function() {
					next();
					timeoutFlag = 1;
					connectionManager.release(connection);
					logger.error('query sql %s %j timeout', sql, params);
				}, queryTimeout);
			}

			var query = connection.query(sql, params, function(err, results) {
				if (timeoutFlag) {
					return;
				}

				clearTimeout(timerId);
				connectionManager.release(connection);
				if (err) {
					return next(err);
				}

				r = r.concat(results);
				next();
			});

			self.print(query.sql);
		});
	}, function(err) {
		logger.debug('end %j', r);
		cb(err, r);
	});
}

DirectPlan.prototype.print = function(sql) {
	// if (process.env.BEARCAT_DEBUG) {
	logger.debug(sql);
	// }
}

module.exports = DirectPlan;