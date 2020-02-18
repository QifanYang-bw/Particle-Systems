// ==================== Sphere CForcer ====================
var SphereField = function() { 

	CForcer.call(this);

	this.pos;
	this.mass;

	this.p;

}

SphereField.prototype = Object.create(CForcer.prototype);
SphereField.prototype.constructor = SphereField;

SphereField.prototype._vectoCenter = function(i) {

    var iloc = this.p.PartObjectSize * i + this.p.PartPosLoc;

    var v = [this.p.s1[iloc + 0],
             this.p.s1[iloc + 1],
             this.p.s1[iloc + 2]];

    var x = v[0] - this.pos[0], y = v[1] - this.pos[1], z = v[2] - this.pos[2];
    var dist2 = x*x + y*y + z*z;
    var dist = Math.sqrt(dist2);


	// console.log(dist2);

	var coeff = this.mass * this.p.s1[this.p.PartObjectSize * i + this.p.PartMLocSingle] / dist2 / dist;

	// console.log(coeff, this.p.PartMLocSingle);

	var vec = [x * coeff, y * coeff, z * coeff];

    return vec;

}


SphereField.prototype.__applyForce = function(p) {

	this.pos = [settings.sphForceX, settings.sphForceX, settings.sphForceX];
	this.mass = settings.sphForceMass;

	this.p = p;


	var j = 0;

	for (var i = 0; i < p.partCount; i++, j+=p.PartObjectSize) {
		var vec = this._vectoCenter(i);

		for (var inc = 0; inc < p.PartDim; inc++) {
			p.s1[j + p.PartFLoc + inc] += vec[inc];
		}
	}

}