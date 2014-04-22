var Bearcat = require('bearcat');
var personDomain = require('../mock/domain/person');
var domainFactory = require('../../lib/util/domainFactory');
var simplepath = require.resolve('../../context.json');
var paths = [simplepath];
var bearcat = Bearcat.createApp(paths);
var tableName = "bearcat_dao_test";

process.env.LOGGER_LINE = true;
bearcat.start(function() {
	// var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
	// domainDaoSupport.initConfig(personDomain);

	// var params = [50, 51];
	// var sql = ' id in (?, ?)';
	// domainDaoSupport.getListByWhere(sql, params, null, function(err, results) {
	// 	domainDaoSupport.batchDelete(results, function(err, _results) {
	// 		console.log(_results);
	// 	});
	// });

	// var domainDaoSupport = bearcat.getBean('domainDaoSupport');
	// domainDaoSupport.initConfig(personDomain);
	// var person1 = domainFactory.getDomain(personDomain);
	// person1.setName('yyy');
	// person1.setNum(100);
	// person1.setCreateAt(Date.now());

	// var list = [];
	// list.push(person1);

	// var person2 = domainFactory.getDomain(personDomain);
	// person2.setName('bbb');
	// person2.setNum(200);
	// person2.setCreateAt(Date.now());

	// list.push(person2);

	// domainDaoSupport.batchAdd(list, function(err, results) {
	// 	err = err || true;

	// });
	var domainDaoSupport = bearcat.getBean('domainDaoSupport');
	domainDaoSupport.initConfig(personDomain);

	var sql = ' 1 = 1'
	var opt = {
		isAsc: false,
		offset: 0,
		limit: 2,
		orderColumn: "id"
	};
	domainDaoSupport.getListByWhere(sql, null, opt, function(err, results) {
		err = err || true;

		domainDaoSupport.batchDelete(results, function(err, _results) {
			err = err || true;

		});
	});
});