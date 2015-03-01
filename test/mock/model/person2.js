var Person2 = function() {
	this.$mid = "person2";
	this.$table = "bearcat_dao_test1";
	this.create_at = "$type:Number";
}

module.exports = {
	func: Person2,
	fields: ["create_at"],
	tableName: "bearcat_dao_test1"
}