var UpdatePlanPerformer = function() {
	this.connectionManager = null;
}

UpdatePlanPerformer.prototype.setConnectionManager = function(connectionManager) {
	this.connectionManager = connectionManager;
}


module.exports = UpdatePlanPerformer;