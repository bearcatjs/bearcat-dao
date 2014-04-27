var lib = process.env.BEARCAT_DAO_COV ? 'lib-cov' : 'lib';

var should = require('should');

var CountDownLatch = require('../../' + lib + '/util/countDownLatch');

describe('countDownLatch', function() {
	describe('countDownLatch', function() {
		it('should do countDownLatch error right', function(done) {
			CountDownLatch.createCountDownLatch();
			CountDownLatch.createCountDownLatch(100);

			var latch = CountDownLatch.createCountDownLatch(100, function() {});
			latch.count = -1;
			latch.done();

			latch.count = 100;
			latch.done(new Error('error'));
			done();
		});
	});
});