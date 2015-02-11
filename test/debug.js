var bearcatDao = require('../../bearcat-dao');
var path = require('path');

var sqlPath = require.resolve('./mock/schema.sql');
var sqlDirPath = path.dirname(sqlPath);

bearcatDao.loadSQL([sqlDirPath]);
var blogResultTable = bearcatDao.getSQL('blogResultTable');
console.log(blogResultTable)