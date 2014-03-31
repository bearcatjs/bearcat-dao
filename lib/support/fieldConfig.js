var fieldConfig = function() {
	this.name = null;
	this.type = null;
}

module.exports = fieldConfig;

fieldConfig.prototype.getName = function() {
	return this.name;
}

fieldConfig.prototype.setName = function(name) {
	this.name = name;
}

fieldConfig.prototype.getType = function() {
	return this.type;
}

fieldConfig.prototype.setType = function(type) {
	this.type = type.toLowerCase();
}