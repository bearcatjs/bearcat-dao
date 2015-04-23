var logger = require('pomelo-logger').getLogger('bearcat-dao', 'SelectPlan');
var PlanHelper = require('../planHelper');
var QueryPlan = require('./queryPlan');
var async = require('async');
var Util = require('util');

var SelectPlan = function(selectDefinition, connectionManager) {
	QueryPlan.call(this);
	this.selectDefinition = selectDefinition;
	this.connectionManager = connectionManager;
	this.init(selectDefinition);
}

Util.inherits(SelectPlan, QueryPlan);

SelectPlan.prototype.init = function(selectDefinition) {
	this.destDB = PlanHelper.getDestDB(selectDefinition);
	this.sql = selectDefinition.getSQL();
	this.params = [];
}

SelectPlan.prototype.start = function(cb) {
	var connectionManager = this.connectionManager;
	var selectDefinition = this.selectDefinition;
	var destDB = this.destDB;
	var sql = this.sql;
	var self = this;

	var selectRole = selectDefinition.getSelectRole();

	var result = [];
	logger.debug("destDB %j sql %s", destDB, sql);

	async.each(destDB, function(destNode, next) {
		connectionManager.getConnection(destNode, selectRole, function(err, connection) {
			if (err) {
				return next(err);
			}

			var query = connection.query(sql, [], function(err, results) {
				connectionManager.release(connection);
				if (err) {
					return next(err);
				}

				result = result.concat(results);
				next();
			});

			self.print(query.sql);
		}, function(err) {
			logger.debug('end %j', result);
			cb(err, result);
		});
	});
}

SelectPlan.prototype.print = function(sql) {
	// if (process.env.BEARCAT_DEBUG) {
	logger.debug(sql);
	// }
}

module.exports = SelectPlan;