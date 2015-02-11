var SqlLoader = require('../../lib/loader/sqlLoader');
var should = require('should');

describe('bearcat-dao', function() {
	describe('sqlLoader', function() {
		it('should do sqlLoader right', function(done) {
			var sqlLoader = new SqlLoader();
			sqlLoader.loadContent();

			done();
		});
	});
});