var bearcatDao = require('../../bearcat-dao');
var should = require('should');
var path = require('path');

describe('bearcat-dao', function() {
	describe('getSQL loadSQL addConfiglocations', function() {
		it('should getSQL loadSQL addConfiglocations right', function(done) {
			var sqlPath = require.resolve('./mock/schema.sql');
			var sqlDirPath = path.dirname(sqlPath);

			bearcatDao.loadSQL();
			bearcatDao.loadSQL([sqlDirPath]);
			var blogResultTable = bearcatDao.getSQL('blogResultTable');
			blogResultTable = blogResultTable.trim();
			blogResultTable.should.eql('blog, author');

			var blogResultList1 = bearcatDao.getSQL('blogResultList1');
			blogResultList1 = blogResultList1.trim();
			console.log(blogResultList1);

			var blogResultList2 = bearcatDao.getSQL('blogResultList2');
			blogResultList2 = blogResultList2.trim();
			console.log(blogResultList2);

			done();
		});

		it('should getSQL error right', function(done) {
			bearcatDao.getSQL();
			bearcatDao.getSQL('xxx');
			bearcatDao.getSQL('authorResult');
			bearcatDao.getSQL('authorResultLaw');

			done();
		});
	});
});