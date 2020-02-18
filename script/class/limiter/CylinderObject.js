// ==================== Wall CLimit ====================
var CylinderObject = function() { 

	CLimit.call(this);

	this.pos;
	this.rad;
	this.height;

	this.p;

}

CylinderObject.prototype = Object.create(CLimit.prototype);
CylinderObject.prototype.constructor = CylinderObject;

CylinderObject.prototype._check = function(i) {

    var iloc = this.p.PartObjectSize * i + this.p.PartPosLoc;

    var v = [this.p.s2[iloc + 0],
             this.p.s2[iloc + 1],
             this.p.s2[iloc + 2]];

    var x = v[0] - this.pos[0], y = v[1] - this.pos[1];
    var dist = Math.sqrt(x*x + y*y);

    var zdist = v[2] - this.pos[2];

    return dist < this.rad && zdist < this.height;

}

CylinderObject.prototype._nearbyPos = function(i) {

    var iloc = this.p.PartObjectSize * i + this.p.PartPosLoc;

    var v = [this.p.s2[iloc + 0],
               this.p.s2[iloc + 1],
               this.p.s2[iloc + 2]];

    var x = v[0] - this.pos[0], y = v[1] - this.pos[1], z = v[2];
    var dist = Math.sqrt(x*x + y*y);

    var coeff = this.rad / dist;

    return [this.pos[0] + x * coeff, this.pos[1] + y * coeff, z];

}

CylinderObject.prototype.__applyLimit = function(p) {

	this.pos = [settings.cylinderX, settings.cylinderY, settings.cylinderZ];
	this.rad = settings.cylinderRad;
	this.height = settings.cylinderHeight;

	this.p = p;

	var j = 0;

	for (var i = 0; i < p.partCount; i++, j+=p.PartObjectSize) {

		if (this._check(i)) {

			var newPos = this._nearbyPos(i);

			// console.log(newPos);

			for (var inc = 0; inc < p.PartDim; inc++) {
				p.s2[j + p.PartPosLoc + inc] = newPos[inc];
			}
		}
	}

}