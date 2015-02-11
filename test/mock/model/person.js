var Person = function() {
	this.$mid = "person";
	this.$table = "bearcat_dao_test";
	this.id = "$primary;type:Number";
	this.num = "$type:Number";
	this.name = "$type:String";
	this.create_at = "$type:Number";
}

Person.prototype.getId = function() {
	return this.id;
}

Person.prototype.getName = function() {
	return this.name;
}

Person.prototype.getNum = function() {
	return this.num;
}

module.exports = Person;