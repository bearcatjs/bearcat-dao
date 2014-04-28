var joinPerson = function() {
	this.id = null;
	this.num = null;
}

joinPerson.prototype.getId = function() {
	return this.id;
}

joinPerson.prototype.setId = function(id) {
	this.id = id;
}

joinPerson.prototype.getNum = function() {
	return this.num;
}

joinPerson.prototype.setNum = function(num) {
	this.num = num;
}

module.exports = {
	func: joinPerson,
	key: "joinPerson",
	primary: [{
		name: "id",
		type: "Long"
	}],
	fields: ["num"]
}