function CLimit() {
	this.enabled = true;
}

CLimit.prototype.applyLimit = function() {
	if (this.enabled) {
		this.__applyLimit();
	}
}

/*
// ==================== Wall CLimit ====================
var Wall = function(direction) { 

	CForcer.call(this);

	// Wall only
	this.g = g

}

Wall.prototype = Object.create(CForcer.prototype);
Wall.prototype.constructor = Wall;

Wall.prototype.__applyForce = function() {

	var j = 0;
	var zInc = 2;

	for (var i = 0; i < this.partCount; i++, j+=PartObjectSize) {
		this.s1[PartFLoc + zInc + j] += this.g;
	}

}
*/