var Bearcat = require('bearcat');
var personDomain = require('../mock/domain/person');
var joinPersonDomain = require('../mock/domain/joinPerson');
var domainFactory = require('../../lib/util/domainFactory');
var simplepath = require.resolve('../../test-context.json');
var path = require('path');
var paths = [simplepath];
var bearcatDao = require('../../lib/bearcat-dao');
var bearcat = Bearcat.createApp(paths);
var tableName = "bearcat_dao_test";
var sqlPath = require.resolve('../mock/schema.sql');
var sqlDirPath = path.dirname(sqlPath);

bearcatDao.loadSQL([sqlDirPath]);

process.env.LOGGER_LINE = true;
process.env.BEARCAT_DEBUG = true;
bearcat.start(function() {
	var domainDaoSupport = bearcat.getBean('domainDaoSupport');
	domainDaoSupport.initConfig("person");

	var id = 1;
	// domainDaoSupport.getList("$blogResultSql", id, "blogResult", function(err, results) {
	// 	err = err || true;
	// 	console.log(err.stack);

	// 	// console.log(results);
	// 	var blogResult = results;
	// 	blogResult.run();
	// 	// console.log(blogResult);
	// })
	var domainDaoSupport = bearcat.getBean('domainDaoSupport');
	domainDaoSupport.initConfig(personDomain);
	var person1 = domainFactory.getDomain(personDomain);
	person1.setName('yyy');
	person1.setNum(100);
	person1.setCreateAt(Date.now());

	var list = [];
	list.push(person1);

	var person2 = domainFactory.getDomain(personDomain);
	person2.setName('bbb');
	person2.setNum(200);
	person2.setCreateAt(Date.now());

	list.push(person2);

	var person3 = domainFactory.getDomain(personDomain);
	person3.setId(Date.now() / 1000);
	person3.setName('ccc');
	person3.setNum(300);
	person3.setCreateAt(Date.now());

	list.push(person3);

	domainDaoSupport.batchAdd(list, function(err, results) {
		console.log(err);
	});
});