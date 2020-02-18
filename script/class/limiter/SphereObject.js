// ==================== Wall CLimit ====================
var SphereObject = function() { 

	CLimit.call(this);

	this.pos;
	this.rad;

	this.p;

}

SphereObject.prototype = Object.create(CLimit.prototype);
SphereObject.prototype.constructor = SphereObject;

SphereObject.prototype._disttoCenter = function(i) {

    var iloc = this.p.PartObjectSize * i + this.p.PartPosLoc;

    var v = [this.p.s2[iloc + 0],
             this.p.s2[iloc + 1],
             this.p.s2[iloc + 2]];

    var x = v[0] - this.pos[0], y = v[1] - this.pos[1], z = v[2] - this.pos[2];
    var dist = Math.sqrt(x*x + y*y + z*z);

    return dist;

}

SphereObject.prototype._nearbyPos = function(i) {

    var iloc = this.p.PartObjectSize * i + this.p.PartPosLoc;

    var v = [this.p.s2[iloc + 0],
               this.p.s2[iloc + 1],
               this.p.s2[iloc + 2]];

    var x = v[0] - this.pos[0], y = v[1] - this.pos[1], z = v[2] - this.pos[2];
    var dist = Math.sqrt(x*x + y*y + z*z);

    var coeff = this.rad / dist;

    return [this.pos[0] + x * coeff, this.pos[1] + y * coeff, this.pos[2] + z * coeff];

}

SphereObject.prototype.__applyLimit = function(p) {

	this.pos = [settings.sphereX, settings.sphereY, settings.sphereZ];
	this.rad = settings.sphereRad;

	this.p = p;

	var j = 0;

	for (var i = 0; i < p.partCount; i++, j+=p.PartObjectSize) {
		var dist = this._disttoCenter(i);

		if (dist < this.rad) {

			var newPos = this._nearbyPos(i);

			// console.log(newPos);

			for (var inc = 0; inc < p.PartDim; inc++) {
				p.s2[j + p.PartPosLoc + inc] = newPos[inc];
			}
		}
	}

}