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

/**
 * DBTransactionManager constructor function.
 *
 * @api public
 */
var DbTransactionManager = function() {
	this.id = 1;
	this.connectionMap = {};
	this.connectionManager = null;
}

module.exports = DbTransactionManager;

/**
 * DBTransactionManager get connection with transactionStatus.
 *
 * @param  {Object} transactionStatus
 * @api public
 */
DbTransactionManager.prototype.getConnection = function(transactionStatus) {
	var id = transactionStatus.getId();
	return this.connectionMap[id];
}

/**
 * DBTransactionManager set connection manager.
 *
 * @param  {Object} connection manager
 * @api public
 */
DbTransactionManager.prototype.setConnectionManager = function(connectionManager) {
	this.connectionManager = connectionManager;
}

/**
 * DBTransactionManager get connection manager.
 *
 * @return  {Object} connection manager
 * @api public
 */
DbTransactionManager.prototype.getConnectionManager = function() {
	return this.connectionManager;
}

/**
 * DBTransactionManager get transaction.
 *
 * @param  {Function} callback function
 * @api public
 */
DbTransactionManager.prototype.getTransaction = function(cb) {
	var self = this;
	this.getConnectionManager().getConnection(function(err, connection) {
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

/**
 * DBTransactionManager commit transaction.
 *
 * @param  {Object}   transactionStatus
 * @param  {Function} callback function
 * @api public
 */
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

/**
 * DBTransactionManager rollback transaction.
 *
 * @param  {Object}   transactionStatus
 * @param  {Function} callback function
 * @api public
 */
DbTransactionManager.prototype.rollback = function(transactionStatus, cb) {
	var connection = this.getConnection(transactionStatus);
	var self = this;
	return connection.rollback(function() {
		cb();
		self.clear(transactionStatus);
	});
}

/**
 * DBTransactionManager clear transaction.
 *
 * @param  {Object}   transactionStatus
 * @api public
 */
DbTransactionManager.prototype.clear = function(transactionStatus) {
	var connection = this.getConnection(transactionStatus);
	this.getConnectionManager().release(connection);
	var id = transactionStatus.getId();
	this.connectionMap[id] = null;
}