/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao TransactionStatus
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var Constant = require('../util/constant');

/**
 * TransactionStatus constructor function.
 *
 * @api public
 */
var TransactionStatus = function() {
	this.id = null;
	this.status = Constant.TRANSACTION_DEFAULT;
}

module.exports = TransactionStatus;

/**
 * TransactionStatus set id.
 *
 * @param  {Number} id
 * @api public
 */
TransactionStatus.prototype.setId = function(id) {
	this.id = id;
}

/**
 * TransactionStatus get id.
 *
 * @return  {Number} id
 * @api public
 */
TransactionStatus.prototype.getId = function() {
	return this.id;
}

/**
 * TransactionStatus set status.
 *
 * @param  {Object} status
 * @api public
 */
TransactionStatus.prototype.setStatus = function(status) {
	this.status = status;
}

/**
 * TransactionStatus get status.
 *
 * @return  {Object} status
 * @api public
 */
TransactionStatus.prototype.getStatus = function() {
	return this.status;
}