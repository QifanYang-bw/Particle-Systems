// ==================== CForcer Abstract Class ====================
var CForcer = function() {
	this.enabled = true;
}

CForcer.prototype.applyForce = function() {
	if (this.enabled) {
		this.__applyForce.apply(this, arguments);
	}
}