var BlogModel = function() {
	this.$mid = "blog";
	this.$table = "blog";
	this.id = "$primary;balance;type:Number";
	this.aid = "$type:Number";
	this.title = "$type:String";
	this.content = "$type:String";
	this.create_at = "$type:Number";
	this.update_at = "$type:Number";
}

module.exports = BlogModel;