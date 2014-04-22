var lib = process.env.BEARCAT_DAO_COV ? 'lib-cov' : 'lib';

var should = require('should');
var Utils = require('../../' + lib + '/util/utils');

describe('bearcat-dao', function() {
	describe('utils', function() {
		it('should utils right', function(done) {
			var r = Utils.checkArray([]);
			r.should.be.true;

			done();
		});
	});
});