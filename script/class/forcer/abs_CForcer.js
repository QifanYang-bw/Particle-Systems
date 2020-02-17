// ==================== CForcer Abstract Class ====================
var CForcer = function() {
	this.enabled = true;
}

CForcer.prototype.applyForce = function() {
	if (this.enabled) {
		this.__applyForce.apply(this, arguments);
	}
}

CForcer.prototype._distonIndex = function(i1, i2) {

    var i1loc = this.p.PartObjectSize * i1 + this.p.PartPosLoc;
    var i2loc = this.p.PartObjectSize * i2 + this.p.PartPosLoc;

    var dist = 0, t = 0;
    for (var inc = 0; inc < this.p.PartDim; inc++) {
        t = this.p.s1[i2loc + inc] - this.p.s1[i1loc + inc];
        dist += t * t;
    }
    dist = Math.sqrt(dist);

    return dist;
}

CForcer.prototype._veconIndex = function(i1, i2) {

    var i1loc = this.p.PartObjectSize * i1 + this.p.PartPosLoc;
    var i2loc = this.p.PartObjectSize * i2 + this.p.PartPosLoc;

    var vec = [this.p.s1[i1loc + 0] - this.p.s1[i2loc + 0], 
               this.p.s1[i1loc + 1] - this.p.s1[i2loc + 1],
               this.p.s1[i1loc + 2] - this.p.s1[i2loc + 2]];

    return vec;
}

CForcer.prototype._distonVec = function(v) {

    var x = v[0], y = v[1], z = v[2];
    var dist = Math.sqrt(x*x + y*y + z*z);

    return dist;
}
