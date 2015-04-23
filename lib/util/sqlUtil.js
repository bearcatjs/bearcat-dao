var Mysql = require('mysql');
var bearcatSQL = require('bearcat-sql');

var SqlUtil = {};

SqlUtil.format = function(sql, params) {
	return Mysql.format(sql, params);
}

SqlUtil.parse = function(sql) {
	return bearcatSQL.parseSQL(sql);
}

SqlUtil.getRelate = function(relate) {
	return bearcatSQL.RELATE_MAP[relate];
}

module.exports = SqlUtil;