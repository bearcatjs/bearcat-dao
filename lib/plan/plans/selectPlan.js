var logger = require('pomelo-logger').getLogger('bearcat-dao', 'SelectPlan');
var PlanHelper = require('../planHelper');
var QueryPlan = require('./queryPlan');
var async = require('async');
var Util = require('util');

var SelectPlan = function(selectDefinition, connectionManager) {
	QueryPlan.call(this);
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
	var destDB = this.destDB;
	var params = this.params;
	var sql = this.sql;
	var self = this;

	var r = [];
	async.each(destDB, function(node, next) {
		connectionManager.getConnection(node, 'master', function(err, connection) {
			if (err) {
				return next(err);
			}

			var query = connection.query(sql, params, function(err, results) {
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

SelectPlan.prototype.print = function(sql) {
	// if (process.env.BEARCAT_DEBUG) {
	logger.debug(sql);
	// }
}

module.exports = SelectPlan;