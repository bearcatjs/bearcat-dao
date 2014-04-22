var lib = process.env.BEARCAT_DAO_COV ? 'lib-cov' : 'lib';

var MysqlConnectionManager = require('../../../' + lib + '/connection/sql/mysqlConnectionManager');
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
				mysqlConnectionManager.destroy(connection);
				done();
			});
		});

		it('should getConnection not right', function(done) {
			var mysqlConnectionManager = new MysqlConnectionManager();
			mysqlConnectionManager.setUser('root');
			mysqlConnectionManager.setPassword('tst');
			mysqlConnectionManager.setDatabase('test');

			mysqlConnectionManager.getConnection(function(err, connection) {
				console.error(err);
				should.exist(err);
				should.not.exist(connection);
				done();
			});
		});

		it('should do not use pool', function(done) {
			var mysqlConnectionManager = new MysqlConnectionManager();
			mysqlConnectionManager.setUsePool(false);
			mysqlConnectionManager.setUser('root');
			mysqlConnectionManager.setPassword('test');
			mysqlConnectionManager.setDatabase('test');

			mysqlConnectionManager.getConnection(function(err, connection) {
				should.not.exist(err);
				should.exist(connection);
				mysqlConnectionManager.release(connection);
				done();
			});
		});

		it('should set get right', function(done) {
			var mysqlConnectionManager = new MysqlConnectionManager();
			mysqlConnectionManager.setPort(3306);
			mysqlConnectionManager.getPort();
			mysqlConnectionManager.setHost('localhost');
			mysqlConnectionManager.getHost();
			mysqlConnectionManager.setUser('root');
			mysqlConnectionManager.getUser();
			mysqlConnectionManager.setPassword('test');
			mysqlConnectionManager.getPassword();
			mysqlConnectionManager.setDatabase('test');
			mysqlConnectionManager.getDatabase();
			mysqlConnectionManager.getUsePool();
			mysqlConnectionManager.getPool();
			mysqlConnectionManager.setOptions();
			mysqlConnectionManager.getOptions();

			mysqlConnectionManager.getConnection(function(err, connection) {
				should.not.exist(err);
				should.exist(connection);
				mysqlConnectionManager.fetchConnector();
				mysqlConnectionManager.end(connection);
				done();
			});
		});
	})
});