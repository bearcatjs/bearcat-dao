var should = require('should');
var SqlBuilderUtil = require('../../lib/util/sqlBuilderUtil');

describe('bearcat-dao', function() {
	describe('sqlBuilderUtil', function() {
		it('should testInsertSql build sql right', function(done) {
			var expected = "insert into User (id, name, age) values (?, ?, ?)";

			var tableName = "User";

			var columns = [];
			columns.push("id");
			columns.push("name");
			columns.push("age");

			var actual = SqlBuilderUtil.buildInsertSql(tableName, columns);

			expected.should.eql(actual);
			done();
		});

		it('should testBatchInsertSql build sql right', function(done) {
			var expected = "insert into User (id, name, age) values (?, ?, ?), (?, ?, ?)";

			var tableName = "User";

			var columns = [];
			columns.push("id");
			columns.push("name");
			columns.push("age");

			var actual = SqlBuilderUtil.buildBatchInsertSql(tableName, columns, 2);

			expected.should.eql(actual);
			done();
		});

		it('should testDeleteSql build sql right', function(done) {
			var expected = "delete from User where (id = ? and name = ? and age = ?)";

			var tableName = "User";

			var columns = [];
			columns.push("id");
			columns.push("name");
			columns.push("age");

			var actual = SqlBuilderUtil.buildDeleteSql(tableName, columns);

			expected.should.eql(actual);
			done();
		});

		it('should testBatchDeleteSql build sql right', function(done) {
			var expected = "delete from User where (id = ? and name = ? and age = ?) or (id = ? and name = ? and age = ?)";

			var tableName = "User";

			var columns = [];
			columns.push("id");
			columns.push("name");
			columns.push("age");

			var actual = SqlBuilderUtil.buildBatchDeleteSql(tableName, columns, 2);

			expected.should.eql(actual);
			done();
		});

		it('should getSql right', function(done) {
			SqlBuilderUtil.getSql();

			done();
		});
	});
});