var TransactionAspect = require('../../lib/aspect/transactionAspect');
var should = require('should');

describe('bearcat-dao', function() {
	describe('TransactionAspect right', function() {
		it('should do transactionAspect right', function(done) {
			var transactionAspect = new TransactionAspect();
			transactionAspect.setDbTransactionManager();
			transactionAspect.getDbTransactionManager();

			done();
		});
	});
});