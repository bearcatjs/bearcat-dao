var async = require('async');

var MultiCommand = function(cmds, client) {
	this.cmds = cmds;
	this.client = client;
	this.queue = [];
}

MultiCommand.prototype.init = function() {
	var cmds = this.cmds;
	for (var i = 0; i < cmds.length; i++) {
		var cmd = cmds[i];
		var r = {
			command: cmd[0],
			key: cmd[1],
			args: cmd.slice(1)
		};


	}
}

MultiCommand.prototype.exec = function(cb) {
	var errors = [];
	var replies = [];
	var self = this;
	cb = cb || function() {};

	async.eachSeries(this.cmds, function(cmd, next) {
		var command = cmd[0];
		var key = cmd[1];
		var args = cmd.slice(1);

		self.client.getClientByKey(key, function(err, clientProxy) {
			if (err) {
				errors.push(err);
				return next();
			}

			if (!clientProxy) {
				errors.push(new Error('client is not exist for key: ' + key));
				return next();
			}

			clientProxy.send_command(command, args, function(err, reply) {
				if (err) {
					errors.push(err);
					replies.push(err.message);
				} else {
					replies.push(reply);
				}

				next();
			});
		});
	}, function() {
		if (errors.length > 0) {
			cb(errors);
		} else {
			cb(null, replies);
		}
	})
}

module.exports = MultiCommand;