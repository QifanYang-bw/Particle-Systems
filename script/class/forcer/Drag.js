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