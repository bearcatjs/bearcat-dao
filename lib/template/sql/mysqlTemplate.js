/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao MysqlTemplate
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'MysqlTemplate');
var CountDownLatch = require('../../util/countDownLatch');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

/**
 * MysqlTemplate constructor function.
 *
 * @api public
 */
var MysqlTemplate = function() {
	this.connectionManager = null;
	this.idTableName = "IDGenerator";
	this.transactionStatus = null;
	this.transactionManager = null;
}

util.inherits(MysqlTemplate, EventEmitter);

module.exports = MysqlTemplate;

/**
 * MysqlTemplate set connection manager.
 *
 * @param  {Object} connectionManager connection manager
 * @api public
 */
MysqlTemplate.prototype.setConnectionManager = function(connectionManager) {
	this.connectionManager = connectionManager;
}

/**
 * MysqlTemplate get connection manager.
 *
 * @return  {Object} connection manager
 * @api public
 */
MysqlTemplate.prototype.getConnectionManager = function() {
	return this.connectionManager;
}

/**
 * MysqlTemplate set transaction manager.
 *
 * @param  {Object} transactionManager transaction manager
 * @api public
 */
MysqlTemplate.prototype.setTransactionManager = function(transactionManager) {
	this.transactionManager = transactionManager;
}

/**
 * MysqlTemplate get transaction manager.
 *
 * @return  {Object} transaction manager
 * @api public
 */
MysqlTemplate.prototype.getTransactionManager = function() {
	return this.transactionManager;
}

/**
 * MysqlTemplate do transaction with transactionStatus to keep session.
 *
 * @param  {Object} transactionStatus
 * @api public
 */
MysqlTemplate.prototype.transaction = function(transactionStatus) {
	this.transactionStatus = transactionStatus;
}

/**
 * MysqlTemplate getConnection from connectionManager or transactionManager.
 *
 * @param  {Function} cb callback function
 * @api public
 */
MysqlTemplate.prototype.getConnection = function(cb) {
	var transactionStatus = this.transactionStatus;
	if (!this.getTransactionManager() || !transactionStatus) {
		return this.connectionManager.getConnection(cb);
	} else {
		var connection = this.transactionManager.getConnection(transactionStatus);
		// get connection from transactionManager
		// reset transactionStatus to null
		this.transaction(null);
		cb(null, connection, true); // transaction tx flag, release the connection after the transaction
	}
}

/**
 * MysqlTemplate set idTableName.
 *
 * @param  {String} idTableName
 * @api public
 */
MysqlTemplate.prototype.setIdTableName = function(idTableName) {
	this.idTableName = idTableName;
}

/**
 * MysqlTemplate get idTableName.
 *
 * @return  {String} idTableName
 * @api public
 */
MysqlTemplate.prototype.getIdTableName = function(idTableName) {
	return this.idTableName;
}


/**
 * MysqlTemplate allocateRecordId for table.
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
MysqlTemplate.prototype.allocateRecordId = function(tableName, cb) {
	var self = this;
	var idTableName = this.getIdTableName();
	this.getConnection(function(err, connection, tx) {
		if (self.handleError(err, cb)) {
			return self;
		}
		var sql = 'UPDATE ' + idTableName + ' SET id = LAST_INSERT_ID(id + 1) WHERE name = ?';
		var query = connection.query(sql, [tableName], function(err, results) {
			if (!tx) {
				self.connectionManager.release(connection);
			}
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
 * MysqlTemplate add record.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api public
 */
MysqlTemplate.prototype.addRecord = function(sql, params, cb) {
	return this.updateRecord(sql, params, cb);
}

/**
 * MysqlTemplate batch add records.
 *
 * @param  {String}   sql
 * @param  {Array}    paramList
 * @param  {Function} cb callback function
 * @api public
 */
MysqlTemplate.prototype.batchAddRecord = function(sql, paramList, cb) {
	return this.batchAddRecords(sql, paramList, cb);
}

/**
 * MysqlTemplate batch add records.
 *
 * @param  {String}   sql
 * @param  {Array}    paramList
 * @param  {Function} cb callback function
 * @api public
 */
MysqlTemplate.prototype.batchAddRecords = function(sql, paramList, cb) {
	return this.batchExecuteUpdate(sql, paramList, cb);
}

/**
 * MysqlTemplate exist record.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api public
 */
MysqlTemplate.prototype.existRecord = function(sql, params, cb) {
	var self = this;
	this.getConnection(function(err, connection, tx) {
		if (self.handleError(err, cb)) {
			return;
		}

		var query = connection.query(sql, params, function(err, results) {
			if (!tx) {
				self.connectionManager.release(connection);
			}
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
 * MysqlTemplate update record.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api public
 */
MysqlTemplate.prototype.updateRecord = function(sql, params, cb) {
	return this.updateRecords(sql, params, cb);
}

/**
 * MysqlTemplate update records.
 *
 * @param  {String}   sql
 * @param  {Array}    paramList
 * @param  {Function} cb callback function
 * @api public
 */
MysqlTemplate.prototype.updateRecords = function(sql, paramList, cb) {
	return this.executeUpdate(sql, paramList, cb);
}

/**
 * MysqlTemplate batch update records.
 *
 * @param  {String}   sql
 * @param  {Array}    paramList
 * @param  {Function} cb callback function
 * @api public
 */
MysqlTemplate.prototype.batchUpdateRecords = function(sql, paramList, cb) {
	return this.batchExecuteUpdate(sql, paramList, cb);
}

/**
 * MysqlTemplate query count.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api public
 */
MysqlTemplate.prototype.queryCount = function(sql, params, cb) {
	var self = this;
	this.getConnection(function(err, connection, tx) {
		if (self.handleError(err, cb)) {
			return;
		}

		var query = connection.query(sql, params, function(err, results) {
			if (!tx) {
				self.connectionManager.release(connection);
			}
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
 * MysqlTemplate execute query.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api private
 */
MysqlTemplate.prototype.executeQuery = function(sql, params, cb) {
	var self = this;
	this.getConnection(function(err, connection, tx) {
		if (self.handleError(err, cb)) {
			return self;
		}

		var query = connection.query(sql, params, function(err, results) {
			if (!tx) {
				self.connectionManager.release(connection);
			}
			if (self.handleError(err, cb)) {
				return self;
			}
			cb(null, results);
		});
		self.print(query.sql);
	});
	return this;
}

/**
 * MysqlTemplate execute update.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api private
 */
MysqlTemplate.prototype.executeUpdate = function(sql, params, cb) {
	var self = this;
	this.getConnection(function(err, connection, tx) {
		if (self.handleError(err, cb)) {
			return self;
		}

		var query = connection.query(sql, params, function(err, result) {
			if (!tx) {
				self.connectionManager.release(connection);
			}
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
 * MysqlTemplate batch execute update.
 *
 * @param  {String}   sql
 * @param  {Array}    paramList
 * @param  {Function} cb callback function
 * @api private
 */
MysqlTemplate.prototype.batchExecuteUpdate = function(sql, paramList, cb) {
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
 * MysqlTemplate print sql.
 *
 * @param  {String}   sql
 * @api private
 */
MysqlTemplate.prototype.print = function(sql) {
	if (process.env.BEARCAT_DEBUG) {
		logger.debug(sql);
	}
}

/**
 * MysqlTemplate error handler.
 *
 * @param  {Object}   error
 * @param  {Function} cb callback function
 * @api private
 */
MysqlTemplate.prototype.handleError = function(err, cb) {
	if (err) {
		cb(err);
		return true;
	}

	return false;
}