var logger = require('pomelo-logger').getLogger('bearcat-dao');
var CountDownLatch = require('../../util/countDownLatch');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var mysqlTemplate = function() {
	this.connectionManager = null;
	this.idTableName = "IDGenerator";
}

util.inherits(mysqlTemplate, EventEmitter);

module.exports = mysqlTemplate;

mysqlTemplate.prototype.setConnectionManager = function(connectionManager) {
	this.connectionManager = connectionManager;
}

mysqlTemplate.prototype.getConnectionManager = function() {
	return this.connectionManager;
}

mysqlTemplate.prototype.getConnection = function(cb) {
	return this.connectionManager.getConnection(cb);
}

mysqlTemplate.prototype.setIdTableName = function(idTableName) {
	this.idTableName = idTableName;
}

mysqlTemplate.prototype.getIdTableName = function(idTableName) {
	return this.idTableName;
}

/*
create table IDGenerator(
    name varchar(50) NOT NULL,
    id bigint(20) unsigned NOT NULL DEFAULT 0,
    
    PRIMARY KEY (name)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
*/
mysqlTemplate.prototype.allocateRecordId = function(tableName, cb) {
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
				return;
			}
			var id = -1;
			if (results && results['insertId']) {
				id = results['insertId'];
			}
			cb(err, id);
		});
		self.print(query.sql);
	});
}

mysqlTemplate.prototype.addRecord = function(sql, params, cb) {
	return this.updateRecord(sql, params, cb);
}

mysqlTemplate.prototype.batchAddRecord = function(sql, paramList, cb) {
	return this.batchAddRecord(sql, paramList, cb);
}

mysqlTemplate.prototype.existRecord = function(sql, params, cb) {
	var self = this;
	this.getConnection(function(err, connection) {
		if (self.handleError(err, cb)) {
			return;
		}

		var query = connection.query(sql, params, function(err, results) {
			self.connectionManager.release(connection);
			if (self.handleError(err, cb)) {
				return;
			}
			if (results && results.length) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		});
		self.print(query.sql);
	});
}

mysqlTemplate.prototype.updateRecord = function(sql, params, cb) {
	return this.updateRecords(sql, params, cb);
}

mysqlTemplate.prototype.updateRecords = function(sql, paramList, cb) {
	return this.executeUpdate(sql, paramList, cb);
}

mysqlTemplate.prototype.batchUpdateRecords = function(sql, paramList, cb) {
	return this.batchExecuteUpdate(sql, paramList, cb);
}

/*
 * select count(*) num from xxx where ?;
 */
mysqlTemplate.prototype.queryCount = function(sql, params, cb) {
	var self = this;
	this.getConnection(function(err, connection) {
		if (self.handleError(err, cb)) {
			return;
		}

		var query = connection.query(sql, params, function(err, results) {
			self.connectionManager.release(connection);
			if (self.handleError(err, cb)) {
				return;
			}
			if (results && results.length) {
				cb(null, results[0]);
			} else {
				cb(null, null);
			}
		});
		self.print(query.sql);
	});
}

mysqlTemplate.prototype.executeQuery = function(sql, params, cb) {
	var self = this;
	this.getConnection(function(err, connection) {
		if (self.handleError(err, cb)) {
			return;
		}

		var query = connection.query(sql, params, function(err, results) {
			self.connectionManager.release(connection);
			if (self.handleError(err, cb)) {
				return;
			}
			cb(null, results);
		});
		self.print(query.sql);
	});
}

mysqlTemplate.prototype.executeUpdate = function(sql, params, cb) {
	var self = this;
	this.getConnection(function(err, connection) {
		if (self.handleError(err, cb)) {
			return;
		}

		var query = connection.query(sql, params, function(err, result) {
			self.connectionManager.release(connection);
			if (self.handleError(err, cb)) {
				return;
			}
			if (result && result['affectedRows']) {
				cb(null, result);
			} else {
				cb(null, null);
			}
		});
		self.print(query.sql);
	});
}

mysqlTemplate.prototype.batchExecuteUpdate = function(sql, paramList, cb) {
	var self = this;
	var len = paramList.length;
	var latch = CountDownLatch.createCountDownLatch(len, function(err) {
		if (self.handleError(err, cb)) {
			return;
		}
		cb(null, true);
	});

	for (var i = 0; i < paramList.length; i++) {
		var params = paramList[i];
		this.executeUpdate(sql, params, function(err, result) {
			latch.done(err);
		});
	}
}

mysqlTemplate.prototype.print = function(sql) {
	logger.debug(sql);
}

mysqlTemplate.prototype.handleError = function(err, cb) {
	if (err) {
		cb(err);
		return true;
	}

	return false;
}