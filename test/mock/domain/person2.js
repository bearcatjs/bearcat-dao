var person2 = function() {
	this.id = null;
	this.name = null;
	this.create_at = 0;
}

person2.prototype.getId = function() {
	return this.id;
}

person2.prototype.setId = function(id) {
	this.id = id;
}

person2.prototype.getName = function() {
	return this.name;
}

person2.prototype.setName = function(name) {
	this.name = name;
}

person2.prototype.getCreateAt = function() {
	return this.create_at;
}

person2.prototype.setCreateAt = function(create_at) {
	this.create_at = create_at;
}

module.exports = {
	func: person2,
	fields: ["create_at"],
	tableName: "bearcat_dao_test1"
}