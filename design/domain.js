var car = function() {
	this.id = null;
	this.wheel = null;
	this.engine = null;
}

car.prototype.run = function() {

}

module.exports = {
	func: car,
	primary: [{
		name: "id",
		type: "Long"
	}],
	tableName: "bc_car"
}