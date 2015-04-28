/*!
 * .______    _______     ___      .______       ______     ___   .__________.
 * (   _  )  (   ____)   /   \     (   _  )     (      )   /   \  (          )
 * |  |_)  ) |  |__     /  ^  \    |  |_)  )   |  ,----'  /  ^  \ `---|  |---`
 * |   _  <  |   __)   /  /_\  \   |      )    |  |      /  /_\  \    |  |
 * |  |_)  ) |  |____ /  _____  \  |  |)  ----.|  `----./  _____  \   |  |
 * (______)  (_______/__/     \__\ ( _| `.____) (______)__/     \__\  |__|
 *
 * Bearcat-dao DDBTemplate
 * Copyright(c) 2015 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */

var logger = require('pomelo-logger').getLogger('bearcat-dao', 'DDBTemplate');
var SqlBuilderUtil = require('../../util/sqlBuilderUtil');
var EventEmitter = require('events').EventEmitter;
var Constant = require('../../util/constant');
var Utils = require('../../util/utils');
var Util = require('util');

/**
 * DDBTemplate constructor function.
 *
 * @api public
 */
var DDBTemplate = function() {
	this.planManager = null;
}

Util.inherits(DDBTemplate, EventEmitter);

/**
 * DDBTemplate execute query.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.executeQuery = function(sql, params, cb) {
	this.planManager.executeQuery(sql, params, cb);
	return this;
}

/**
 * DDBTemplate direct query with destDBs.
 *
 * @param  {String}   sql
 * @param  {Array}    params
 * @param  {Object}   destDB, role options
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.directQuery = function(sql, params, options, cb) {
	this.planManager.directQuery(sql, params, options, cb);
	return this;
}

/**
 * DDBTemplate direct add object.
 *
 * @param  {Object}   object
 * @param  {Object}   table, destDB, role options
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.directAdd = function(object, options, cb) {
	return this.directBatchAdd([object], options, cb);
}

/**
 * DDBTemplate batch direct add objects.
 *
 * @param  {Array}    objects
 * @param  {Object}   table, destDB, role options
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.directBatchAdd = function(objects, options, cb) {
	if (!Utils.checkArray(objects)) {
		return cb();
	}

	var table = options['table'];
	if (!table) {
		return cb(new Error('directBatchAdd error no table options'));
	}

	var len = objects.length;
	if (!len) {
		return cb();
	}

	var fields = [];
	var params = [];
	var flag = 0;

	for (var i = 0; i < len; i++) {
		var object = objects[i];

		for (var key in object) {
			if (!flag) {
				fields.push(key);
			}
			params.push(object[key]);
		}

		flag = 1;
	}

	var sql = SqlBuilderUtil.buildBatchInsertSql(table, fields, len);

	return this.directQuery(sql, params, options, cb);
}

/**
 * DDBTemplate direct update object by id.
 *
 * @param  {Object}   object
 * @param  {Object}   table, destDB, role, id options
 * @param  {Function} cb callback function
 * @api public
 */
DDBTemplate.prototype.directUpdateById = function(object, options, cb) {
	if (!object) {
		return cb();
	}

	var table = options['table'];
	if (!table) {
		return cb(new Error('directUpdateById error no table options'));
	}

	var idField = options['id'];
	var ID_FIELD = idField || Constant.ID_FIELD;
	var fields = [];
	var params = [];
	var id = null;

	for (var key in object) {
		if (key == ID_FIELD) {
			id = object[ID_FIELD];
			continue;
		}

		fields.push(key);
		params.push(object[key]);
	}

	params.push(id);

	var sql = SqlBuilderUtil.buildUpdateSql(table, fields, [ID_FIELD]);

	return this.directQuery(sql, params, options, cb);
}

/**
 * DDBTemplate print sql.
 *
 * @param  {String}   sql
 * @api private
 */
DDBTemplate.prototype.print = function(sql) {
	if (process.env.BEARCAT_DEBUG) {
		logger.debug(sql);
	}
}

/**
 * DDBTemplate error handler.
 *
 * @param  {Object}   error
 * @param  {Function} cb callback function
 * @api private
 */
DDBTemplate.prototype.handleError = function(err, cb) {
	if (err) {
		cb(err);
		return true;
	}

	return false;
}

module.exports = DDBTemplate;