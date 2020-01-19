
// ==================== CForcer Abstract Class ====================
var CForcer = function() {
	this.enabled = true;
}

CForcer.prototype.applyForce = function() {
	if (this.enabled) {
		this.__applyForce();
	}
}

// ==================== Gravity CForcer ====================
var Gravity = function(g = 9.832) { 

	CForcer.call(this);

	// Gravity only
	this.g = g

}

Gravity.prototype = Object.create(CForcer.prototype);
Gravity.prototype.constructor = Gravity;

Gravity.prototype.__applyForce = function() {

	var j = 0;
	var zInc = 2;

	for (var i = 0; i < this.partCount; i++, j+=PartObjectSize) {
		this.s1[PartFLoc + zInc + j] += this.g;
	}

}

// ==================== Drag CForcer ====================
var Drag = function(coeff = 0.985) { 

	CForcer.call(this);

	if (coeff > 1) {
		console.log("Warning! Drag Coefficient larger than 1 at " + coeff + " !");
	}

	// Drag coeff only
	this.coeff = coeff

}

Drag.prototype = Object.create(CForcer.prototype);
Drag.prototype.constructor = Drag;
Drag.prototype.__applyForce = function() {

	var j = 0;

	for (var i = 0; i < this.partCount; i++, j+=PartObjectSize) {
		for (var inc = 0; inc < PartDim; inc++) {
			var tinc = j + inc;

			this.s1[PartFLoc + tinc] *= coeff;

		}
	}

}