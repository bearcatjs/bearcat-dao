var should = require('should');
var Bearcat = require('bearcat');
var personDomain = require('../mock/domain/person');
var person1Domain = require('../mock/domain/person1');
var person2Domain = require('../mock/domain/person2');
var joinPersonDomain = require('../mock/domain/joinPerson');
var domainFactory = require('../../lib/util/domainFactory');

describe('domainDaoSupport', function() {
	var simplepath = require.resolve('../../test-context.json');
	var paths = [simplepath];
	var tableName = "bearcat_dao_test";
	var tableName1 = "bearcat_dao_test1";
	var bearcat = Bearcat.createApp(paths);

	before(function(done) {
		bearcat.start(function() {
			done();
		});
	});

	describe('get domainDaoSupport', function() {
		it('should get domainDaoSupport right', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
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
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
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
				err = err || true;
				err.should.be.true;
				results.should.exist;

				results.length.should.eql(3);
				for (var i = 0; i < results.length; i++) {
					results[i]['id'].should.exist;
				}

				done();
			});
		});
	});

	describe('domainDaoSupport batchUpdate', function() {
		it('should batchUpdate right', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var params = [3, 5];
			var sql = ' id in (?, ?)';
			var opt = {
				isAsc: true,
				offset: 0,
				limit: 2,
				orderColumn: "create_at"
			};
			domainDaoSupport.getListByWhere(sql, params, opt, function(err, results) {
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

					person.setName(name);
					person.setNum(num + 100);
					person.setCreateAt(Date.now());
				}

				domainDaoSupport.batchUpdate([results[0]], function(err, _results) {
					err = err || true;
					err.should.be.true;
					_results.length.should.eql(1);

					domainDaoSupport.update(results[1], function(err, _results) {
						err = err || true;
						err.should.be.true;

						done();
					});
				});
			});
		});
	});

	describe('domainDaoSupport batchDelete', function() {
		it('should batchDelete right', function(done) {
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
				err.should.be.true;

				results.length.should.eql(2);


				domainDaoSupport.batchDelete([results[0]], function(err, _results) {
					err = err || true;
					err.should.be.true;

					if (_results)
						_results.should.exist;

					domainDaoSupport.delete(results[1], function(err, _results) {
						err = err || true;
						err.should.be.true;

						if (_results)
							_results.should.exist;
						done();
					});
				});
			});
		});
	});

	describe('domainDaoSupport getList', function() {
		it('should getList right', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var sql = 'select * from ' + tableName;
			var opt = {
				isAsc: true,
				offset: 0,
				limit: 2,
				orderColumn: "create_at"
			};
			domainDaoSupport.getList(sql, null, opt, function(err, results) {
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
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);
			var id = 3;
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
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);
			var id = 3;

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
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
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
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var id = 3;
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
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var params = [3, 5];
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
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var params = [3, 5];
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
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var params = [1, 2];
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

	describe('domainDaoSupport exist', function() {
		it('should exist right', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var params = [3];
			var sql = 'select * from ' + tableName + ' where id = ?';

			domainDaoSupport.exists(sql, params, function(err, result) {
				err = err || true;
				err.should.be.true;

				result.should.be.true;

				done();
			});
		});
	});

	describe('domainDaoSupport updateColumn', function() {
		it('should updateColumn right', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var columnName = "name";
			var newValue = "aaa";
			var primarysValue = [3];

			domainDaoSupport.updateColumn(columnName, newValue, primarysValue, function(err, results) {
				err = err || true;
				err.should.be.true;

				results.should.exist;
				results.affectedRows.should.eql(1);

				var sql = 'update ' + tableName + ' set name = ? where id = ?';
				domainDaoSupport.update(sql, ['aaa', 6], function(err) {
					err = err || true;
					err.should.be.true;

					done();
				});
			});
		});
	});

	describe('domainDaoSupport updateColumnValue', function() {
		it('should updateColumnValue right', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var columnName = "name";
			var newValue = "aaa";
			var conditionColumn = ["id"];
			var conditionValue = [3];

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
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
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
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
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

	describe('domainDaoSupport transaction', function() {
		it('should do transaction rollback right', function(done) {
			var personService = bearcat.getBean('personService');
			personService.testMethodTransaction(function(err, results) {
				personService.testMethodTransaction(function(err, results) {
					done();
				});
			});
		});

		it('should do transaction commit right', function(done) {
			var personService = bearcat.getBean('personService');
			personService.testMethodRTransaction(function(err, results) {
				done();
			});
		});
	});

	describe('domainDaoSupport init config error', function() {
		it('should do init config error', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig({});

			domainDaoSupport.initConfig({
				func: function() {}
			});

			done();
		});
	});

	describe('domainDaoSupport add person1 with join primary key', function() {
		it('should add person1 with join primary key right', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			var person1Dao = bearcat.getBean('person1Dao');

			domainDaoSupport.allocateRecordId(tableName1, function(err, id) {
				err = err || true;
				err.should.be.true;
				id.should.exist;
				var person1 = domainFactory.getDomain(person1Domain);
				person1.setId(id);
				person1.setName('yy');
				person1.setCreateAt(Date.now());

				person1Dao.add(person1, function(err) {
					err = err || true;
					err.should.be.true;

					done();
				});
			});
		});
	});

	describe('domainDaoSupport set get', function() {
		it('should do set get right', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');

			domainDaoSupport.setSqlTemplate();
			domainDaoSupport.setCacheTemplate();

			var cb = function() {};
			domainDaoSupport.batchAdd(null, cb);
			domainDaoSupport.doBatchAdd(null, cb);
			domainDaoSupport.batchUpdate(null, cb);
			domainDaoSupport.batchDelete(null, cb);
			domainDaoSupport.batchDeleteByPrimaryKey(null, cb);
			domainDaoSupport.updateColumn('aaa', 'aaa', null, cb);
			domainDaoSupport.updateColumnValue('aaa', 'aaa', null, 'aaa', cb);

			done();
		});
	});

	describe('domainDaoSupport error without primary fields definition', function() {
		it('should do error without primary fields definition', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(person2Domain);

			var cb = function() {}
			domainDaoSupport.batchUpdate([{}], cb);
			domainDaoSupport.batchDelete([{}], cb);
			domainDaoSupport.updateColumn('aaa', 'aaa', [], cb);

			done();
		});
	});

	describe('domainDaoSupport primary fields params size error', function() {
		it('should do primary fields params size error', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var cb = function() {}
			domainDaoSupport.updateColumn('id', 'aaa', [], cb);
			domainDaoSupport.getByPrimary([], cb);

			done();
		});
	});

	describe('domainDaoSupport redis cache', function() {
		it('should do redis cache operation right', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');

			var key = 'bearcat';
			var value = 'bearcat';

			var countKey = 'bearcatCount';
			var initCount = 100;

			domainDaoSupport.addToCache(key, value, 100);

			domainDaoSupport.getStringFromCache(key, function(err, num) {
				err = err || true;
				err.should.be.true;
				num.should.eql(value);

				domainDaoSupport.setCounter(countKey, initCount);
				domainDaoSupport.incr(countKey);
				domainDaoSupport.incrBy(countKey, 2);
				domainDaoSupport.getCounter(countKey, function(err, num) {
					err = err || true;
					err.should.be.true;
					num.should.eql(103);
					domainDaoSupport.removeFromCache(key);
					done();
				});
			});
		});
	});

	describe('domainDaoSupport join select right', function() {
		it('should do join select right', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			domainDaoSupport.initConfig(personDomain);

			var sql = 'select bearcat_dao_test.id, bearcat_dao_test.num from bearcat_dao_test, bearcat_dao_test1 where bearcat_dao_test.id = bearcat_dao_test1.id'

			var opt = {
				domain: joinPersonDomain
			}

			domainDaoSupport.getList(sql, null, opt, function(err, results) {
				err = err || true;
				err.should.be.true;

				for (var i = 0; i < results.length; i++) {
					var person = results[i];
					person.should.exist;
					person.should.be.an.instanceOf(joinPersonDomain.func);
					var id = person.getId();
					var num = person.getNum();
					id.should.exist;
					num.should.exist;
				}
				done();
			});
		});
	});
});