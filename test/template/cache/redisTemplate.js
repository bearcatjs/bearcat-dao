var lib = process.env.BEARCAT_DAO_COV ? 'lib-cov' : 'lib';

var should = require('should');
var Bearcat = require('bearcat');

describe('redisTemplate', function() {
	var simplepath = require.resolve('../../../test-context.json');
	var paths = [simplepath];
	var bearcat = Bearcat.createApp(paths);

	before(function(done) {
		bearcat.start(function() {
			done();
		});
	});

	describe('redisTemplate set get right', function() {
		it('should redisTemplate set get right', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			var cacheTemplate = domainDaoSupport.getCacheTemplate();
			domainDaoSupport.should.exist;
			cacheTemplate.should.exist;

			cacheTemplate.setConnectionManager();
			cacheTemplate.getConnectionManager();
			cacheTemplate.setExpireDay(100);
			cacheTemplate.getExpireDay();

			cacheTemplate.addToCache();
			cacheTemplate.addToList();
			cacheTemplate.setStringToList();
			cacheTemplate.deleteStringFromList();
			cacheTemplate.deleteStringsFromList();
			cacheTemplate.delFromCache();
			cacheTemplate.expire();

			done();
		});
	});

	describe('redisTemplate do list right', function() {
		it('should do list right', function(done) {
			var domainDaoSupport = bearcat.getBean('domainDaoSupport');
			var cacheTemplate = domainDaoSupport.getCacheTemplate();

			var key = 'bearcat_list';
			var value = 100;
			cacheTemplate.addToList(key, value);

			cacheTemplate.setExpireDay(100);
			cacheTemplate.expire(key);
			cacheTemplate.getStringFromList(key, 0, function(err, r) {
				r.should.eql(value);

				cacheTemplate.getListLength(key, function(err, r) {
					r.should.eql(1);

					cacheTemplate.getStringListRange(key, 0, 0, function(err, r) {
						r.length.should.eql(1);
						r[0].should.eql(value);

						cacheTemplate.keyExists(key, function(err, r) {
							r.should.eql(1);

							value += 100;
							cacheTemplate.setStringToList(key, 0, value);

							cacheTemplate.getStringFromList(key, 0, function(err, r) {
								r.should.eql(value);

								cacheTemplate.deleteStringFromList(key, value);

								cacheTemplate.keyExists(key, function(err, r) {
									r.should.eql(0);

									done();
								});
							});
						});
					});
				});
			});
		});
	});
});