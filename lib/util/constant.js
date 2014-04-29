/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao Constant
 * Copyright(c) 2014 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

module.exports = {
	DEFAULT_REDIS_PORT: 6379,
	DEFAULT_REDIS_HOST: '127.0.0.1',
	DEFAULT_MYSQL_PORT: 3306,
	DEFAULT_MYSQL_HOST: '127.0.0.1',
	DEFAULT_MYSQL_USE_POOL: true,
	DEFAULT_MYSQL_CONNECT_CB: function() {},

	TYPE_LONG: 'long',

	TRANSACTION_DEFAULT: "",
	TRANSACTION_START: "tstart"
}