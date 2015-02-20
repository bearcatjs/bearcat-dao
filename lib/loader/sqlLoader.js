/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao SqlLoader
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'SqlLoader');
var Constant = require('../util/constant');
var FileUtil = require('../util/fileUtil');
var Utils = require('../util/utils');

var SqlLoader = function() {
	this.idMap = {};
	this.idResultMap = {};
}

SqlLoader.prototype.getSQL = function(sqlId) {
	if (!Utils.isNotNull(sqlId)) {
		logger.error('getSQL error sqlId must not be null');
		return;
	}

	var resultSql = this.idResultMap[sqlId];
	if (!resultSql) {
		resultSql = this.doGetSQL(sqlId);
	}

	return resultSql;
}

SqlLoader.prototype.doGetSQL = function(sqlId) {
	var originSql = this.idMap[sqlId];

	if (!originSql) {
		logger.warn('get sql warn, no such sql %s exists', sqlId);
		return;
	}

	var refs = originSql.match(Constant.SQL_REF);

	if (!refs) {
		return originSql;
	}

	var resultSql = originSql;
	for (var i = 0; i < refs.length; i++) {
		var refSql = refs[i];
		var refSqlId = refSql.match(Constant.SQL_REF_ID);
		if (!refSqlId) {
			continue;
		}

		refSqlId = refSqlId[1];
		var refSqlContent = this.getSQL(refSqlId);
		if (refSqlContent) {
			resultSql = resultSql.replace(refSql, refSqlContent);
		}
	}

	this.updateSqlResultMap(sqlId, resultSql);
	return resultSql;
}

SqlLoader.prototype.load = function(locations) {
	for (var i = 0; i < locations.length; i++) {
		this.loadPath(locations[i]);
	}
}

SqlLoader.prototype.loadPath = function(location) {
	var files = [];
	FileUtil.readDirFiles(location, files);

	for (var i = 0; i < files.length; i++) {
		this.loadFile(files[i]);
	}
}

SqlLoader.prototype.loadFile = function(path) {
	if (!FileUtil.checkFileType(path, Constant.FILE_TYPE_SQL)) {
		return;
	}

	var content = FileUtil.readFileSync(path);
	this.loadContent(content);
}

SqlLoader.prototype.loadContent = function(content) {
	if (!content) {
		return;
	}

	// remove comments
	content = content.replace(Constant.COMMENT_LINE_1, "")
	content = content.replace(Constant.COMMENT_LINE_2, "");
	content = content.replace(Constant.COMMENT_STAR, "");

	content = content.trim();

	var blocks = content.match(Constant.CONTENT_BLOCK);

	if (!blocks) {
		return;
	}

	for (var i = 0; i < blocks.length; i++) {
		var blockContent = blocks[i];
		var sqlM = blockContent.match(Constant.CONTENT_BLOCK_SQL);
		if (!sqlM) {
			continue;
		}

		var sqlId = sqlM[1];
		var sqlContent = sqlM[2];
		this.updateSqlMap(sqlId, sqlContent);
	}

	this.prcessSQLPlaceHolder();
}

SqlLoader.prototype.updateSqlMap = function(id, content) {
	content = content.replace(Constant.CONTENT_SQL_TRIM, " ");

	this.idMap[id] = content;
}

SqlLoader.prototype.updateSqlResultMap = function(id, content) {
	this.idResultMap[id] = content;
}

SqlLoader.prototype.getSqlMap = function() {
	return this.idMap;
}

SqlLoader.prototype.prcessSQLPlaceHolder = function() {
	var sqlMap = this.getSqlMap();

	for (var id in sqlMap) {
		this.getSQL(id);
	}
}

module.exports = SqlLoader;