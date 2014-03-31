var MysqlConnectionManager = require('../../../lib/connection/sql/mysqlConnectionManager');
var should = require('should');

describe('bearcat-dao', function() {
	describe('mysqlConnectionManager', function() {
		it('should getConnection right', function(done) {
			var mysqlConnectionManager = new MysqlConnectionManager();
			mysqlConnectionManager.setUser('root');
			mysqlConnectionManager.setPassword('test');
			mysqlConnectionManager.setDatabase('test');

			mysqlConnectionManager.getConnection(function(err, connection) {
				should.not.exist(err);
				should.exist(connection);
				done();
			});
		});
	})
});