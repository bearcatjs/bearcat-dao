var PersonDomain = require('../../mock/domain/person');
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
	var sql = ' aid in (?, ?)';
	this.domainDaoSupport.getListByWhere(sql, params, null, function(err, results) {
		cb(err, results);
	});
}

PersonDao.prototype.addPerson = function(params, cb) {
	var sql = 'insert into ' + this.domainDaoSupport.getTableConfig().getTableName() + ' set id = ?, num = ?, name = ?, create_at = ?';
	this.domainDaoSupport.add(sql, params, cb);
}