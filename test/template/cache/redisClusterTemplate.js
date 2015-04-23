var simplepath = require.resolve('../../../test-ddb-context.json');
var bearcat = require('bearcat');
var path = require('path');
var paths = [simplepath];
bearcat.createApp(paths);

process.env.LOGGER_LINE = true;
bearcat.start(function() {
	var redisTemplate = bearcat.getBean('redisTemplate');
	var num = 1;
	var setAndGet = function(num) {
		var key = 'aaa_' + num;
		redisTemplate.set(key, 'bearcat', function(err, reply) {
			if (err) {
				console.log('redis error %s', err.stack);
				redisTemplate.restartHaClient();
			}

			if (reply !== 'OK') {
				console.log('reply %s', reply);
			}

			redisTemplate.get(key, function(err, reply) {
				if (err) {
					console.log('redis error %s', err.stack);
				}

				if (reply !== 'bearcat') {
					console.log('reply %s', reply);
				}
			});
		});
	}

	// setTimeout(function() {
	setInterval(function() {
		for (var i = 0; i < 100; i++) {
			(function(num) {
				setAndGet(num);
			})(i)
		}
	}, 3000);
});

process.on('uncaughtException', function(err) {
	console.error('Caught exception: ', err.stack);
});