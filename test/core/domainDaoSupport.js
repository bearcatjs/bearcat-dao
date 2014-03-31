var should = require('should');
var bearcat = require('bearcat');
var ApplicationContext = bearcat.getApplicationContext();
var personDomain = require('../mock/domain/person');
var domainFactory = require('../../lib/util/domainFactory');

describe('domainDaoSupport', function() {
	var simplepath = require.resolve('../../context.json');
	var paths = [simplepath];
	var tableName = "bearcat_dao_test";
	var applicationContext = new ApplicationContext(paths);

	before(function(done) {
		applicationContext.on('finishRefresh', function() {
			done();
		});
		applicationContext.refresh();
	});

	describe('get domainDaoSupport', function() {
		it('should get domainDaoSupport right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			var sqlTemplate = domainDaoSupport.getSqlTemplate();
			var cacheTemplate = domainDaoSupport.getCacheTemplate();
			domainDaoSupport.should.exist;
			sqlTemplate.should.exist;
			cacheTemplate.should.exist;

			done();
		});
	});

	describe('domainDaoSupport allocateRecordId', function() {
		it('should allocateRecordId right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.allocateRecordId(tableName, function(err, id) {
				err = err || true;
				err.should.be.true;
				id.should.exist;
				done();
			});
		});
	});

	describe('domainDaoSupport batchAdd', function() {
		it('should batchAdd right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
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

			domainDaoSupport.batchAdd(list, function(err, results) {
				err = err || true;
				err.should.be.true;
				results.should.exist;

				results.length.should.eql(2);
				for (var i = 0; i < results.length; i++) {
					results[i]['id'].should.exist;
				}

				done();
			});
		});
	});

	describe('domainDaoSupport batchUpdate', function() {
		it('should batchUpdate right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var params = [24, 35];
			var sql = ' id in (?, ?)';
			domainDaoSupport.getListByWhere(sql, params, null, function(err, results) {
				err = err || true;
				err.should.be.true;

				results.length.should.eql(2);

				for (var i = 0; i < results.length; i++) {
					var person = results[i];
					person.should.exist;
					person.should.be.an.instanceOf(personDomain.func);
					var id = person.getId();
					var name = person.getName();
					var num = person.getNum();
					id.should.exist;
					name.should.exist;
					num.should.exist;

					person.setName(name + '_u');
					person.setNum(num + 100);
					person.setCreateAt(Date.now());
				}

				domainDaoSupport.batchUpdate(results, function(err, _results) {
					err = err || true;
					err.should.be.true;
					_results.length.should.eql(2);

					done();
				});
			});
		});
	});

	describe('domainDaoSupport batchDelete', function() {
		it('should batchDelete right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var params = [50, 51];
			var sql = ' id in (?, ?)';
			domainDaoSupport.getListByWhere(sql, params, null, function(err, results) {
				err = err || true;
				err.should.be.true;

				results.length.should.eql(0);

				domainDaoSupport.batchDelete(results, function(err, _results) {
					err = err || true;
					err.should.be.true;

					if (_results)
						_results.should.exist;

					done();
				});
			});
		});
	});

	describe('domainDaoSupport getList', function() {
		it('should getList right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var sql = 'select * from ' + tableName;
			domainDaoSupport.getList(sql, null, null, function(err, results) {
				err = err || true;
				err.should.be.true;
				results.should.exist;

				for (var i = 0; i < results.length; i++) {
					var person = results[i];
					person.should.exist;
					person.should.be.an.instanceOf(personDomain.func);
					var id = person.getId();
					var name = person.getName();
					var num = person.getNum();
					id.should.exist;
					name.should.exist;
					num.should.exist;
				}
				done();
			});
		});
	});

	describe('domainDaoSupport getByPrimary', function() {
		it('should getByPrimary right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);
			var id = 24;
			var params = [id];

			domainDaoSupport.getByPrimary(params, function(err, results) {
				err = err || true;
				err.should.be.true;
				results.should.exist;

				results.length.should.eql(1);

				var person = results[0];
				person.should.exist;
				person.should.be.an.instanceOf(personDomain.func);
				var id = person.getId();
				var name = person.getName();
				var num = person.getNum();
				id.should.exist;
				name.should.exist;
				num.should.exist;

				done();
			});
		});
	});

	describe('domainDaoSupport getById', function() {
		it('should getById right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);
			var id = 24;

			domainDaoSupport.getById(id, function(err, results) {
				err = err || true;
				err.should.be.true;
				results.should.exist;

				results.length.should.eql(1);

				var person = results[0];
				person.should.exist;
				person.should.be.an.instanceOf(personDomain.func);
				var id = person.getId();
				var name = person.getName();
				var num = person.getNum();
				id.should.exist;
				name.should.exist;
				num.should.exist;

				done();
			});
		});
	});

	describe('domainDaoSupport getCount', function() {
		it('should getCount right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var sql = 'select count(*) num from ' + tableName;
			domainDaoSupport.getCount(sql, null, function(err, results) {
				err = err || true;
				err.should.be.true;

				results.num.should.exist;
				done();
			});
		});
	});

	describe('domainDaoSupport getByWhere', function() {
		it('should getByWhere right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var id = 24;
			var sql = ' id = ?';
			domainDaoSupport.getByWhere(sql, id, function(err, results) {
				err = err || true;
				err.should.be.true;

				results.length.should.eql(1);

				var person = results[0];
				person.should.exist;
				person.should.be.an.instanceOf(personDomain.func);
				var id = person.getId();
				var name = person.getName();
				var num = person.getNum();
				id.should.exist;
				name.should.exist;
				num.should.exist;

				done();
			})
		});
	});

	describe('domainDaoSupport getListByWhere', function() {
		it('should getListByWhere right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var params = [24, 35];
			var sql = ' id in (?, ?)';
			domainDaoSupport.getListByWhere(sql, params, null, function(err, results) {
				err = err || true;
				err.should.be.true;

				results.length.should.eql(2);

				for (var i = 0; i < results.length; i++) {
					var person = results[i];
					person.should.exist;
					person.should.be.an.instanceOf(personDomain.func);
					var id = person.getId();
					var name = person.getName();
					var num = person.getNum();
					id.should.exist;
					name.should.exist;
					num.should.exist;
				}
				done();
			});
		});
	});

	describe('domainDaoSupport getCountByWhere', function() {
		it('should getCountByWhere right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var params = [24, 35];
			var sql = ' id in (?, ?)';

			domainDaoSupport.getCountByWhere(sql, params, function(err, results) {
				err = err || true;
				err.should.be.true;

				results.should.exist;
				results.num.should.eql(2);

				done();
			});
		});
	});

	describe('domainDaoSupport removeByWhere', function() {
		it('should removeByWhere right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var params = [38, 39];
			var sql = ' id in (?, ?)';

			domainDaoSupport.removeByWhere(sql, params, function(err, results) {
				err = err || true;
				err.should.be.true;

				if (results)
					results.should.exist;

				done();
			});
		});
	});

	describe('domainDaoSupport updateColumn', function() {
		it('should updateColumn right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var columnName = "name";
			var newValue = "aaa";
			var primarysValue = [56];

			domainDaoSupport.updateColumn(columnName, newValue, primarysValue, function(err, results) {
				err = err || true;
				err.should.be.true;

				results.should.exist;
				results.affectedRows.should.eql(1);

				done();
			});
		});
	});

	describe('domainDaoSupport updateColumnValue', function() {
		it('should updateColumnValue right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var columnName = "name";
			var newValue = "aaa";
			var conditionColumn = ["id"];
			var conditionValue = [56];

			domainDaoSupport.updateColumnValue(columnName, newValue, conditionColumn, conditionValue, function(err, results) {
				err = err || true;
				err.should.be.true;

				results.should.exist;
				results.affectedRows.should.eql(1);

				done();
			});
		})
	});

	describe('domainDaoSupport deleteById', function() {
		it('should deleteById right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var id = 63;

			domainDaoSupport.deleteById(id, function(err, results) {
				err = err || true;
				err.should.be.true;

				if (results)
					results.should.exist;
				done();
			});
		})
	});

	describe('domainDaoSupport deleteByPrimaryKey', function() {
		it('should deleteByPrimaryKey right', function(done) {
			var domainDaoSupport = applicationContext.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var params = [63];

			domainDaoSupport.deleteByPrimaryKey(params, function(err, results) {
				err = err || true;
				err.should.be.true;

				if (results)
					results.should.exist;
				done();
			});
		});
	});
});