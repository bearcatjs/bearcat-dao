var simplepath = require.resolve('../../../test-ddb-context.json');
var bearcatDao = require('../../../lib/bearcat-dao');
var bearcat = require('bearcat');
var path = require('path');
var paths = [simplepath];
bearcat.createApp(paths);

process.env.LOGGER_LINE = true;
bearcat.start(function() {
	// directQuery();
	// for (var i = 0; i < 10; i++) {
	// query();
	// }
	// add();
	update();
});

function query() {
	var sqlTemplate = bearcat.getBean('sqlTemplate');
	// var sql = "select blog.id blog_id, title, content, name from blog, author where blog.aid = author.id";
	// var sql = "select id as idd, title from blog group by idd";
	// var sql = "select title from blog where id > 1 group by title, create_at";
	// var sql = "select title from blog where id > 1 order by title asc, create_at";
	var sql = "select id, title from blog where id = 1 or id = 5";
	// var sql = "select id, title from blog where id between 1 and 5";
	// var sql = "select id, title from blog where id between (1 and 5)";
	// var sql = "select id, title from blog where title is null";
	// var sql = "select id, title from blog where id not in (1, 2)";
	// var sql = "select id, title from blog where id > 1";
	// var sql = "select 1";
	sqlTemplate.executeQuery(sql, [], function(err, results) {
		if (err) {
			console.log(err);
		}

		// console.log(results);
	});
}

function directQuery() {
	var sqlTemplate = bearcat.getBean('sqlTemplate');
	// var sql = "select blog.id blog_id, title, content, name from blog, author where blog.aid = author.id";
	// var sql = "select id as idd, title from blog group by idd";
	// var sql = "select title from blog where id > 1 group by title, create_at";
	// var sql = "select title from blog where id > 1 order by title asc, create_at";
	// var sql = "select id, title from blog where id = 1 or id = 5";
	// var sql = "select id, title from blog where id between 1 and 5";
	// var sql = "select id, title from blog where id between (1 and 5)";
	// var sql = "select id, title from blog where title is null";
	// var sql = "select id, title from blog where id not in (1, 2)";
	// var sql = "select id, title from blog where id > 1";
	// var sql = "select 1";
	var sql = "insert into blog (id, aid, title, content, create_at, update_at) values (10, 10, 'test_title_10', 'test_content_10', 1424659231463, 1424659231463)";
	// var sql = "insert into author (id, name ,create_at, update_at) values (10, 'test_author_10', 123456, 123456)";

	var options = {
		destDB: '*',
		role: 'master'
	}

	options['destDB'] = bearcatDao.calDestDBs('blog', 'id', [10]);

	sqlTemplate.directQuery(sql, [], options, function(err, results) {
		if (err) {
			console.log(err.stack);
		}

		var sql = "select * from blog where id = 10";
		console.log(results);

		sqlTemplate.directQuery(sql, [], options, function(err, results) {
			console.log(results);
		});
	});
}

function add() {
	var sqlTemplate = bearcat.getBean('sqlTemplate');

	var options = {
		destDB: '*',
		role: 'master',
		table: 'author'
	}

	var object = null;
	options['destDB'] = bearcatDao.calDestDBs('blog', 'id', [11]);

	var author = {
		id: 11,
		name: 'test_author_11',
		create_at: 123456,
		update_at: 123456
	}

	sqlTemplate.directAdd(author, options, function(err, results) {
		if (err) {
			console.log(err.stack);
		}

		console.log(results);
	});
}

function update() {
	var sqlTemplate = bearcat.getBean('sqlTemplate');

	var options = {
		destDB: '*',
		role: 'master',
		table: 'author'
	}

	var object = null;
	options['destDB'] = bearcatDao.calDestDBs('blog', 'id', [11]);

	var author = {
		id: 11,
		name: 'test_author_11_update',
		create_at: 123456,
		update_at: 123456
	}

	sqlTemplate.directUpdateById(author, options, function(err, results) {
		if (err) {
			console.log(err.stack);
		}

		console.log(results);
	});
}