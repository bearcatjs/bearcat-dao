var PersonDomain = require('../../mock/domain/person1');
var PersonDao = function() {
	this.domainDaoSupport = null;
}

module.exports = PersonDao;

PersonDao.prototype.setDomainDaoSupport = function(domainDaoSupport) {
	this.domainDaoSupport = domainDaoSupport;
}

PersonDao.prototype.getDomainDaoSupport = function() {
	return this.domainDaoSupport;
}

PersonDao.prototype.init = function() {
	this.domainDaoSupport.initConfig(PersonDomain);
}

PersonDao.prototype.transaction = function(transactionStatus) {
	this.domainDaoSupport.transaction(transactionStatus);
	return this;
}

PersonDao.prototype.getList = function(params, cb) {
	var sql = ' id in (?, ?)';
	this.domainDaoSupport.getListByWhere(sql, params, null, function(err, results) {
		cb(err, results);
	});
}

PersonDao.prototype.add = function(obj, cb) {
	this.domainDaoSupport.add(obj, cb);
}