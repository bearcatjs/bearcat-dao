var bearcat = require('bearcat');
var ApplicationContext = bearcat.getApplicationContext();
var personDomain = require('../mock/domain/person');
var domainFactory = require('../../lib/util/domainFactory');
var simplepath = require.resolve('../../context.json');
var paths = [simplepath];
var tableName = "bearcat_dao_test";
var applicationContext = new ApplicationContext(paths);

applicationContext.on('finishRefresh', function() {
	var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
	domainDaoSupport.initConfig(personDomain);

	var params = [50, 51];
	var sql = ' id in (?, ?)';
	domainDaoSupport.getListByWhere(sql, params, null, function(err, results) {
		domainDaoSupport.batchDelete(results, function(err, _results) {
			console.log(_results);
		});
	});
});

applicationContext.refresh();