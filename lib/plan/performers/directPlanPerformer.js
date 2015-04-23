var DirectPlanPerformer = function() {}

DirectPlanPerformer.prototype.executeQuery = function(directPlan, cb) {
	directPlan.start(cb);
}

module.exports = DirectPlanPerformer;