// ==================== TCentripetal CForcer ====================
var TCentripetal = function(g = 9.832) { 

	CForcer.call(this);

	// TCentripetal only

	this.center = [0.0, 0.0];
	this.height = 6;

}

TCentripetal.prototype = Object.create(CForcer.prototype);
TCentripetal.prototype.constructor = TCentripetal;

TCentripetal.prototype.__applyForce = function(p) {

	var j = 0;

	for (var i = 0; i < p.partCount; i++, j+=p.PartObjectSize) {

		var diffVec = [-p.s1[j + p.PartPosLoc + 0] - this.center[0], -p.s1[j + p.PartPosLoc + 1] - this.center[1], 0];
		var x = this._distonVec(diffVec);

		var h = p.s1[j + p.PartPosLoc + 2];

		var fSize = 2 - Math.log(x) + h / this.height;

		// diffVec[2] = 1e-3;

		for (var inc = 0; inc < p.PartDim; inc++) {
			diffVec[inc] /= x + 1e-4;

			p.s1[j + p.PartFLoc + inc] += fSize * 10 * diffVec[inc];
		}
	}

}