// ==================== Gravity CForcer ====================
var Gravity = function(g = 9.832) { 

	CForcer.call(this);

	// Gravity only
	this.g = g;
	this.dInc = 2; //z axis

}

Gravity.prototype = Object.create(CForcer.prototype);
Gravity.prototype.constructor = Gravity;

Gravity.prototype.__applyForce = function(p) {

	var j = 0;

	for (var i = 0; i < p.partCount; i++, j+=p.PartObjectSize) {

		p.s1[p.PartFLoc + this.dInc + j] -= this.g;
	}


}