// ==================== Wall Abstract Class ====================
function CLimit() {
	this.enabled = true;
}

CLimit.prototype.applyLimit = function() {
	if (this.enabled) {
		this.__applyLimit.apply(this, arguments);
	}
}