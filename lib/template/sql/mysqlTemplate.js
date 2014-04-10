/**
 * .______    _______     ___      .______       ______     ___   .__________.
 * |   _  )  |   ____)   /   \     |   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * |______)  |_______/__/     \__\ | _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao MysqlTemplate
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao');
var CountDownLatch = require('../../util/countDownLatch');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var MysqlTemplate = function() {
	this.connectionManager = null;
	this.idTableName = "IDGenerator";
	this.transactionStatus = null;
	this.transactionManager = null;
}

util.inherits(MysqlTemplate, EventEmitter);

module.exports = MysqlTemplate;

MysqlTemplate.prototype.setConnectionManager = function(connectionManager) {
	this.connectionManager = connectionManager;
}

MysqlTemplate.prototype.getConnectionManager = function() {
	return this.connectionManager;
}

MysqlTemplate.prototype.setTransactionManager = function(transactionManager) {
	this.transactionManager = transactionManager;
}

MysqlTemplate.prototype.getTransactionManager = function() {
	return this.transactionManager;
}

MysqlTemplate.prototype.transaction = function(transactionStatus) {
	this.transactionStatus = transactionStatus;
}

MysqlTemplate.prototype.getConnection = function(cb) {
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

MysqlTemplate.prototype.setIdTableName = function(idTableName) {
	this.idTableName = idTableName;
}

MysqlTemplate.prototype.getIdTableName = function(idTableName) {
	return this.idTableName;
}

/*
create table IDGenerator(
    name varchar(50) NOT NULL,
    id bigint(20) unsigned NOT NULL DEFAULT 0,
    
    PRIMARY KEY (name)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
*/
MysqlTemplate.prototype.allocateRecordId = function(tableName, cb) {
	var self = this;
	var idTableName = this.idTableName;
	this.getConnection(function(err, connection) {
		if (self.handleError(err, cb)) {
			return;
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
			cb(err, id);
		});
		self.print(query.sql);
	});
	return this;
}

MysqlTemplate.prototype.addRecord = function(sql, params, cb) {
	return this.updateRecord(sql, params, cb);
}

MysqlTemplate.prototype.batchAddRecord = function(sql, paramList, cb) {
	return this.batchAddRecord(sql, paramList, cb);
}

MysqlTemplate.prototype.existRecord = function(sql, params, cb) {
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

MysqlTemplate.prototype.updateRecord = function(sql, params, cb) {
	return this.updateRecords(sql, params, cb);
}

MysqlTemplate.prototype.updateRecords = function(sql, paramList, cb) {
	return this.executeUpdate(sql, paramList, cb);
}

MysqlTemplate.prototype.batchUpdateRecords = function(sql, paramList, cb) {
	return this.batchExecuteUpdate(sql, paramList, cb);
}

/*
 * select count(*) num from xxx where ?;
 */
MysqlTemplate.prototype.queryCount = function(sql, params, cb) {
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

MysqlTemplate.prototype.executeQuery = function(sql, params, cb) {
	var self = this;
	this.getConnection(function(err, connection) {
		if (self.handleError(err, cb)) {
			return self;
		}

		var query = connection.query(sql, params, function(err, results) {
			self.connectionManager.release(connection);
			if (self.handleError(err, cb)) {
				return self;
			}
			cb(null, results);
		});
		self.print(query.sql);
	});
	return this;
}

MysqlTemplate.prototype.executeUpdate = function(sql, params, cb) {
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

MysqlTemplate.prototype.print = function(sql) {
	logger.debug(sql);
}

MysqlTemplate.prototype.handleError = function(err, cb) {
	if (err) {
		cb(err);
		return true;
	}

	return false;
}