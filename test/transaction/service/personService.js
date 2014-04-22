var PersonService = function() {
	this.personDao = null;
}

module.exports = PersonService;

PersonService.prototype.testMethodTransaction = function(cb, txStatus) {
	var params = [108, 100, 'fni', Date.now()];
	var self = this;
	this.personDao.transaction(txStatus).addPerson(params, function(err, results) {
		if (err) {
			cb(err);
			return;
		}
		self.personDao.transaction(txStatus).getAList([1, 2], function(err, results) {
			if (err) {
				cb(err);
				return;
			}
			cb(null, results);
		});
	});
}

PersonService.prototype.testMethodRTransaction = function(cb, txStatus) {
	var params = [100, 100, 'fni', Date.now()];
	var self = this;
	this.personDao.transaction(txStatus).addPerson(params, function(err, results) {
		if (err) {
			cb(err);
			return;
		}
		self.personDao.transaction(txStatus).getList([1, 2], function(err, results) {
			if (err) {
				cb(err);
				return;
			}
			cb(null, results);
		});
	});
}