var person = function() {
	this.id = null;
	this.num = null;
	this.name = null;
	this.create_at = 0;
}

person.prototype.getId = function() {
	return this.id;
}

person.prototype.setId = function(id) {
	this.id = id;
}

person.prototype.getNum = function() {
	return this.num;
}

person.prototype.setNum = function(num) {
	this.num = num;
}

person.prototype.getName = function() {
	return this.name;
}

person.prototype.setName = function(name) {
	this.name = name;
}

person.prototype.getCreateAt = function() {
	return this.create_at;
}

person.prototype.setCreateAt = function(create_at) {
	this.create_at = create_at;
}

module.exports = {
	func: person,
	primary: [{
		name: "id",
		type: "Long"
	}],
	fields: ["num", "name", "create_at"],
	tableName: "bearcat_dao_test"
}