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