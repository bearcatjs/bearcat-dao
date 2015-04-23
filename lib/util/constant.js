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
	DEFAULT_REDIS_CONNECT_CB: function() {},

	TYPE_LONG: 'long',
	TYPE_NUMBER: 'number',

	TRANSACTION_DEFAULT: "",
	TRANSACTION_START: "tstart",

	FILE_TYPE_SQL: 'sql',

	COMMENT_LINE_1: /\/\/.*?\n/g,
	COMMENT_LINE_2: /\-\-.*?\n/g,
	COMMENT_STAR: /\/\*(.|\s)*?\*\//g,

	CONTENT_BLOCK: /sql\s*\w+(.|\s)*?end/g,
	CONTENT_BLOCK_SQL: /sql\s*(\w+)((.|\s)*?)end/,
	CONTENT_SQL_TRIM: /\n\s*/g,
	SQL_REF: /\$\{\w+\}/g,
	SQL_REF_ID: /\$\{(\w+)\}/,

	DOLLAR_PREFIX: '$',

	PLAN_QUERY: 'select',

	SQL_SELECT_PART: {
		COLUMN: 'column',
		SOURCE: 'source',
		JOIN: 'joinmap',
		WHERE: 'where',
		GROUPBY: 'groupby',
		ORDERBY: 'orderby',
		LIMIT: 'limit'
	},

	ROLE_MASTER: 'master',
	ROLE_SLAVE: 'slave',

	LEXTER_TYPE_NUMBER: 2,

	SELECT_CONDITION_EQUAL: "=",
	SELECT_CONDITION_IN: "in",
	SELECT_CONDITION_NOT_IN: "not in",
	SELECT_CONDITION_NOT_NULL: "not null",
	SELECT_CONDITION_BETWEEN: "between",
	SELECT_CONDITION_VALUE_TYPE_KEYWORD: 1,
	SELECT_CONDITION_VALUE_TYPE_STRING: 3,
	SELECT_CONDITION_VALUE_TYPE_OPERATOR: 7,
	CLUSTER_MAP_PATH: "clusterSharding.json",
	MYSQL_CLUSTER_MAP_PATH: "mysqlSharding.json",
	REDIS_CLUSTER_MAP_PATH: "redisSharding.json",
	DEST_DB_ALL: "*",

	ORDER_ASC: 1,
	ORDER_DESC: 2,

	REDIS_RETRY_MAX_DELAY: 30 * 1000,

	ID_FIELD: "id",

	REDIS_CLUSTER_COMMANDS: [
		'del', 'expire', 'ttl',
		'get', 'set', 'exists',
		'llen', 'lrem', 'lpush', 'lrange',
		'sadd', 'scard', 'smembers', 'srem',
		'zadd', 'zcard', 'zrangebyscore',
		'zrem', 'zrange', 'zremrangebyrank',
		'zscore'
	]
}