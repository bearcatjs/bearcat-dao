var person1 = function() {
	this.id = null;
	this.name = null;
	this.create_at = 0;
}

person1.prototype.getId = function() {
	return this.id;
}

person1.prototype.setId = function(id) {
	this.id = id;
}

person1.prototype.getName = function() {
	return this.name;
}

person1.prototype.setName = function(name) {
	this.name = name;
}

person1.prototype.getCreateAt = function() {
	return this.create_at;
}

person1.prototype.setCreateAt = function(create_at) {
	this.create_at = create_at;
}

module.exports = {
	func: person1,
	primary: [{
		name: "id",
		type: "Long"
	}, {
		name: "name",
		type: "String"
	}],
	fields: ["create_at"],
	tableName: "bearcat_dao_test1"
}