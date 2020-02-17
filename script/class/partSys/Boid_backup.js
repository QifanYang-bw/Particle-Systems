
// NOT USED

/*
var Boid = function() { 

	PartSys.apply(this, arguments);

	this.speed = 1;

}

Boid.prototype = Object.create(PartSys.prototype);
Boid.prototype.constructor = Boid;

Boid.prototype.dotFinder = function() {

	// Find s1dot by applying Newton’s laws to Ftot

	var j = 0;

	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {

		for (var inc = 0; inc < this.PartDim; inc++) {
			var tinc = j + inc;

			this.s1dot[this.PartPosLoc + tinc] = this.s1[this.PartVelLoc + tinc];

			// Assuming constant Mass
			// F = ma, a = F/m
			this.s1dot[this.PartVelLoc + tinc] = this.s1[this.PartFLoc + tinc] / this.s1[this.PartMLocSingle + j];

			if (this.enableMassChange && Math.abs(this.s1dot[this.PartMLocSingle + j] - 0) > 1e-6) {
				this.s1dot[this.PartVelLoc + tinc] += this.s1dot[this.PartMLocSingle + j] * this.s1[this.PartVelLoc + tinc]
			}


		}
	}

	// Calculates this.s1dot
}
*/