/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao TransactionAspect
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'TransactionAspect');

/**
 * TransactionAspect constructor function.
 *
 * @api public
 */
var TransactionAspect = function() {
	this.dbTransactionManager = null;
}

module.exports = TransactionAspect;

/**
 * TransactionAspect set dbTransactionManager.
 *
 * @param  {Object} dbTransactionManager
 * @api public
 */
TransactionAspect.prototype.setDbTransactionManager = function(dbTransactionManager) {
	this.dbTransactionManager = dbTransactionManager;
}

/**
 * TransactionAspect get dbTransactionManager.
 *
 * @param  {Object} dbTransactionManager
 * @api public
 */
TransactionAspect.prototype.getDbTransactionManager = function() {
	return this.dbTransactionManager;
}

/**
 * TransactionAspect do transaction action.
 *
 * @api public
 */
TransactionAspect.prototype.doInTransaction = function() {
	var self = this;
	arguments = Array.prototype.slice.apply(arguments);
	var target = arguments.shift();
	var method = arguments.shift();
	var next = arguments.pop();
	var args = arguments;
	var nargs = [];

	logger.info('begain transaction');
	this.dbTransactionManager.getTransaction(function(err, transactionStatus) {
		if (err) {
			logger.error('get transaction error ' + err.message);
			return;
		}

		var n = function(err) {
			arguments = Array.prototype.slice.apply(arguments);
			nargs = arguments;
			if (err) {
				logger.error('transaction error ' + err.message);
				self.dbTransactionManager.rollback(transactionStatus, function() {
					next.apply(null, nargs);
				});
				return;
			}

			self.dbTransactionManager.commit(transactionStatus, function(err) {
				if (err) {
					logger.error('transaction commit error' + err.message);
					self.dbTransactionManager.rollback(transactionStatus, function() {
						next.apply(null, nargs);
					});
					return;
				}
				logger.info('transaction success');
				next.apply(null, nargs);
			});
		}

		args.push(n);
		args.push(transactionStatus);
		try {
			target[method].apply(target, args);
		} catch (e) {
			if (e) {
				logger.error('transaction error ' + e.stack);
				self.dbTransactionManager.rollback(transactionStatus, function() {
					next.apply(null, nargs);
					return;
				});
			}
		}
	});
}