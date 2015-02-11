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
bearcat.start(function() {
	var domainDaoSupport = bearcat.getBean('domainDaoSupport');
	domainDaoSupport.initConfig("person");

	var id = 1;
	domainDaoSupport.getList("$blogResultSql", id, "blogResult", function(err, results) {
		err = err || true;
		console.log(err.stack);

		// console.log(results);
		var blogResult = results;
		blogResult.run();
		// console.log(blogResult);
	})
});