var async = require('async');

var MultiCommand = function(cmds, client, tx) {
	this.tx = tx;
	this.cmds = cmds;
	this.client = client;
	this.queue = [];
}

MultiCommand.prototype.exec = function(cb) {
	var errors = [];
	var replies = [];
	var self = this;
	var cmds = this.cmds;
	cb = cb || function() {};

	if (!cmds || !cmds.length) {
		return cb();
	}

	if (this.tx) {
		return this.execTx(cb);
	}

	async.eachSeries(cmds, function(cmd, next) {
		var key = cmd[1];
		var command = cmd[0];
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

MultiCommand.prototype.execTx = function(cb) {
	var cmds = this.cmds;
	var cmd = cmds[0];
	var key = cmd[1];
	var self = this;

	self.client.getClientByKey(key, function(err, clientProxy) {
		if (err) {
			return cb(err);
		}

		clientProxy.multi(cmds).exec(cb);
	});
}

module.exports = MultiCommand;