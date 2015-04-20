/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao DDBTemplate
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'DDBTemplate');
var EventEmitter = require('events').EventEmitter;
var Util = require('util');

/**
 * DDBTemplate constructor function.
 *
 * @api public
 */
var DDBTemplate = function() {
	this.planManager = null;
	this.connectionManager = null;
	this.idTableName = "IDGenerator";
	this.transactionStatus = null;
	this.transactionManager = null;
}

Util.inherits(DDBTemplate, EventEmitter);

/**
 * DDBTemplate set connection manager.
 *
 * @param  {Object} connectionManager connection manager
 * @api public
 */
DDBTemplate.prototype.setConnectionManager = function(connectionManager) {
	this.connectionManager = connectionManager;
}

/**
 * DDBTemplate get connection manager.
 *
 * @return  {Object} connection manager
 * @api public
 */
DDBTemplate.prototype.getConnectionManager = function() {
	return this.connectionManager;
}

/**
 * DDBTemplate set transaction manager.
 *
 * @param  {Object} transactionManager transaction manager
 * @api public
 */
DDBTemplate.prototype.setTransactionManager = function(transactionManager) {
	this.transactionManager = transactionManager;
}

/**
 * DDBTemplate get transaction manager.
 *
 * @return  {Object} transaction manager
 * @api public
 */
DDBTemplate.prototype.getTransactionManager = function() {
	return this.transactionManager;
}

/**
 * DDBTemplate do transaction with transactionStatus to keep session.
 *
 * @param  {Object} transactionStatus
 * @api public
 */
DDBTemplate.prototype.transaction = function(transactionStatus) {
	this.transactionStatus = transactionStatus;
}

/**
 * DDBTemplate getConnection from connectionManager or transactionManager.
 *
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.getConnection = function(cb) {
	var transactionStatus = this.transactionStatus;
	if (!this.getTransactionManager() || !transactionStatus) {
		return this.connectionManager.getConnection(cb);
	} else {
		var connection = this.transactionManager.getConnection(transactionStatus);
		// get connection from transactionManager
		// reset transactionStatus to null
		this.transaction(null);
		cb(null, connection);
	}
}

/**
 * DDBTemplate set idTableName.
 *
 * @param  {String} idTableName
 * @api public
 */
DDBTemplate.prototype.setIdTableName = function(idTableName) {
	this.idTableName = idTableName;
}

/**
 * DDBTemplate get idTableName.
 *
 * @return  {String} idTableName
 * @api public
 */
DDBTemplate.prototype.getIdTableName = function(idTableName) {
	return this.idTableName;
}

/**
 * DDBTemplate allocateRecordId for table.
 * create the IDGenerator
 * add the records of tableNames
 *
 * @param  {String}   tableName
 * @param  {Function} cb callback function
 * @api public
 *
 * create table IDGenerator(
 *   name varchar(50) NOT NULL,
 *   id bigint(20) unsigned NOT NULL DEFAULT 0,
 *
 *   PRIMARY KEY (name)
 * )ENGINE=InnoDB DEFAULT CHARSET=utf8;
 */
DDBTemplate.prototype.allocateRecordId = function(tableName, cb) {
	var self = this;
	var idTableName = this.getIdTableName();
	this.getConnection(function(err, connection) {
		if (self.handleError(err, cb)) {
			return self;
		}
		var sql = 'UPDATE ' + idTableName + ' SET id = LAST_INSERT_ID(id + 1) WHERE name = ?';
		var query = connection.query(sql, [tableName], function(err, results) {
			self.connectionManager.release(connection);
			if (self.handleError(err, cb)) {
				return self;
			}
			var id = -1;
			if (results && results['insertId']) {
				id = results['insertId'];
			}

			if (id === -1) {
				sql = 'INSERT INTO ' + idTableName + ' (name, id) values (?, 0)';
				self.executeUpdate(sql, [tableName], function(err) {
					if (self.handleError(err, cb)) {
						return self;
					}

					return self.allocateRecordId(tableName, cb);
				});
			} else {
				cb(err, id);
			}
		});
		self.print(query.sql);
	});
	return this;
}

/**
 * DDBTemplate add record.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.addRecord = function(sql, params, cb) {
	return this.updateRecord(sql, params, cb);
}

/**
 * DDBTemplate batch add records.
 *
 * @param  {String}   sql
 * @param  {Array}    paramList
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.batchAddRecord = function(sql, paramList, cb) {
	return this.batchAddRecords(sql, paramList, cb);
}

/**
 * DDBTemplate batch add records.
 *
 * @param  {String}   sql
 * @param  {Array}    paramList
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.batchAddRecords = function(sql, paramList, cb) {
	return this.batchExecuteUpdate(sql, paramList, cb);
}

/**
 * DDBTemplate exist record.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.existRecord = function(sql, params, cb) {
	var self = this;
	this.getConnection(function(err, connection) {
		if (self.handleError(err, cb)) {
			return;
		}

		var query = connection.query(sql, params, function(err, results) {
			self.connectionManager.release(connection);
			if (self.handleError(err, cb)) {
				return self;
			}
			if (results && results.length) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		});
		self.print(query.sql);
	});
	return this;
}

/**
 * DDBTemplate update record.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.updateRecord = function(sql, params, cb) {
	return this.updateRecords(sql, params, cb);
}

/**
 * DDBTemplate update records.
 *
 * @param  {String}   sql
 * @param  {Array}    paramList
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.updateRecords = function(sql, paramList, cb) {
	return this.executeUpdate(sql, paramList, cb);
}

/**
 * DDBTemplate batch update records.
 *
 * @param  {String}   sql
 * @param  {Array}    paramList
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.batchUpdateRecords = function(sql, paramList, cb) {
	return this.batchExecuteUpdate(sql, paramList, cb);
}

/**
 * DDBTemplate query count.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.queryCount = function(sql, params, cb) {
	var self = this;
	this.getConnection(function(err, connection) {
		if (self.handleError(err, cb)) {
			return;
		}

		var query = connection.query(sql, params, function(err, results) {
			self.connectionManager.release(connection);
			if (self.handleError(err, cb)) {
				return self;
			}
			if (results && results.length) {
				cb(null, results[0]);
			} else {
				cb(null, null);
			}
		});
		self.print(query.sql);
	});
	return this;
}

/**
 * DDBTemplate execute query.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api private
 */
DDBTemplate.prototype.executeQuery = function(sql, params, cb) {
	this.planManager.executeQuery(sql, params, cb);
	return this;
}

/**
 * DDBTemplate direct query with destDBs.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Object}   destDB, role options
 * @param  {Function} cb callback function
 * @api private
 */
DDBTemplate.prototype.directQuery = function(sql, params, options, cb) {
	this.planManager.directQuery(sql, params, options, cb);
	return this;
}

/**
 * DDBTemplate execute update.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api private
 */
DDBTemplate.prototype.executeUpdate = function(sql, params, cb) {
	var self = this;
	this.getConnection(function(err, connection) {
		if (self.handleError(err, cb)) {
			return self;
		}

		var query = connection.query(sql, params, function(err, result) {
			self.connectionManager.release(connection);
			if (self.handleError(err, cb)) {
				return self;
			}
			if (result && result['affectedRows']) {
				cb(null, result);
			} else {
				cb(null, null);
			}
		});
		self.print(query.sql);
	});
	return this;
}

/**
 * DDBTemplate batch execute update.
 *
 * @param  {String}   sql
 * @param  {Array}    paramList
 * @param  {Function} cb callback function
 * @api private
 */
DDBTemplate.prototype.batchExecuteUpdate = function(sql, paramList, cb) {
	var self = this;
	var len = paramList.length;
	var latch = CountDownLatch.createCountDownLatch(len, function(err) {
		if (self.handleError(err, cb)) {
			return self;
		}
		cb(null, true);
	});

	for (var i = 0; i < paramList.length; i++) {
		var params = paramList[i];
		this.executeUpdate(sql, params, function(err, result) {
			latch.done(err);
		});
	}
	return this;
}

/**
 * DDBTemplate print sql.
 *
 * @param  {String}   sql
 * @api private
 */
DDBTemplate.prototype.print = function(sql) {
	if (process.env.BEARCAT_DEBUG) {
		logger.debug(sql);
	}
}

/**
 * DDBTemplate error handler.
 *
 * @param  {Object}   error
 * @param  {Function} cb callback function
 * @api private
 */
DDBTemplate.prototype.handleError = function(err, cb) {
	if (err) {
		cb(err);
		return true;
	}

	return false;
}

module.exports = DDBTemplate;