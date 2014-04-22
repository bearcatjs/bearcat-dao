/**
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao DbTransactionManager
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'DbTransactionManager');
var TransactionStatus = require('./transactionStatus');
var Constant = require('../util/constant');

var DbTransactionManager = function() {
	this.id = 1;
	this.connectionMap = {};
	this.connectionManager = null;
}

module.exports = DbTransactionManager;

DbTransactionManager.prototype.getConnection = function(transactionStatus) {
	var id = transactionStatus.getId();
	return this.connectionMap[id];
}

DbTransactionManager.prototype.setConnectionManager = function(connectionManager) {
	this.connectionManager = connectionManager;
}

DbTransactionManager.prototype.getConnectionManager = function() {
	return this.connectionManager;
}

DbTransactionManager.prototype.getTransaction = function(cb) {
	var self = this;
	this.connectionManager.getConnection(function(err, connection) {
		if (err) {
			cb(err);
			return;
		}

		connection.beginTransaction(function(err) {
			if (err) {
				cb(err);
				return;
			}
			var id = self.id++;
			self.connectionMap[id] = connection;
			var transactionStatus = new TransactionStatus();
			transactionStatus.setId(id);
			transactionStatus.setStatus(Constant.TRANSACTION_START);
			cb(null, transactionStatus);
		});
	});
}

DbTransactionManager.prototype.commit = function(transactionStatus, cb) {
	var self = this;

	var connection = this.getConnection(transactionStatus);
	connection.commit(function(err) {
		if (err) {
			return self.rollback(transactionStatus, function() {
				cb(err);
			});
		}
		cb();
		self.clear(transactionStatus);
	});
}

DbTransactionManager.prototype.rollback = function(transactionStatus, cb) {
	logger.error('rollback %j', transactionStatus);
	var connection = this.getConnection(transactionStatus);
	var self = this;
	return connection.rollback(function() {
		cb();
		self.clear(transactionStatus);
	});
}

DbTransactionManager.prototype.clear = function(transactionStatus) {
	var connection = this.getConnection(transactionStatus);
	this.connectionManager.release(connection);
	var id = transactionStatus.getId();
	this.connectionMap[id] = null;
}