var OrderByDefinition = function() {
	this.name = null;
	this.type = null;
	this.orderType = null;
}

OrderByDefinition.prototype.setName = function(name) {
	this.name = name;
}

OrderByDefinition.prototype.getName = function() {
	return this.name;
}

OrderByDefinition.prototype.setType = function(type) {
	this.type = type;
}

OrderByDefinition.prototype.getType = function() {
	return this.type;
}

OrderByDefinition.prototype.setOrderType = function(orderType) {
	this.orderType = orderType;
}

OrderByDefinition.prototype.getOrderType = function() {
	return this.orderType;
}

OrderByDefinition.prototype.getSQL = function() {
	var sql = this.name;

	return sql;
}

module.exports = OrderByDefinition;