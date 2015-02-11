var SqlLoader = require('../../lib/loader/sqlLoader');
var fs = require('fs');

var sqlLoader = new SqlLoader();

var content = fs.readFileSync('query.sql').toString();

sqlLoader.loadContent(content);

var r = sqlLoader.getSQL("blogResultList2");
console.log(r);