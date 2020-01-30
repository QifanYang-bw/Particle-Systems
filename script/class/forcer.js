// ==================== CForcer Abstract Class ====================
var CForcer = function() {
	this.enabled = true;
}

CForcer.prototype.applyForce = function() {
	if (this.enabled) {
		this.__applyForce.apply(this, arguments);
	}
}

// ==================== Gravity CForcer ====================
var Gravity = function(g = 9.832) { 

	CForcer.call(this);

	// Gravity only
	this.g = g;

}

Gravity.prototype = Object.create(CForcer.prototype);
Gravity.prototype.constructor = Gravity;

Gravity.prototype.__applyForce = function(p) {

	// console.log('before');
 //  	console.log(partVec.s1);

	var j = 0;
	var zInc = 2; //y Axis

	for (var i = 0; i < p.partCount; i++, j+=p.PartObjectSize) {

		// console.log(p.s1[p.PartFLoc + zInc + j], this.g);
		p.s1[p.PartFLoc + zInc + j] -= this.g;
	}

	// console.log('after');
 //  	console.log(partVec.s1);
	// console.log('---');

}

// ==================== Drag CForcer ====================
var Drag = function(coeff = 0.985) { 

	CForcer.call(this);

	if (coeff > 1) {
		console.log("Warning! Drag Coefficient larger than 1 at " + coeff + " !");
	}

	// Drag coeff only
	this.revcoeff = 1 - coeff;

}

Drag.prototype = Object.create(CForcer.prototype);
Drag.prototype.constructor = Drag;
Drag.prototype.__applyForce = function(p) {

	var j = 0;
	var curcoeff = this.revcoeff * 1000 / g_timeStep;
	// console.log(g_timeStep, curcoeff);

	for (var i = 0; i < p.partCount; i++, j+=p.PartObjectSize) {
		for (var inc = 0; inc < p.PartDim; inc++) {
			var tinc = j + inc;

			// F = ma， F_g=cMV
			p.s1[p.PartFLoc + tinc] -= p.s1[p.PartMLocSingle + j] * p.s1[p.PartVelLoc + tinc] * curcoeff;

		}
	}

}