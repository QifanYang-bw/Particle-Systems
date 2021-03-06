// ==================== RandomBehaviour CForcer ====================
var RandomBehaviour = function(coeff = 2) { 

	CForcer.call(this);

	// RandomBehaviour only
	this.coeff = coeff;

}

RandomBehaviour.prototype = Object.create(CForcer.prototype);
RandomBehaviour.prototype.constructor = RandomBehaviour;

RandomBehaviour.prototype.__applyForce = function(p) {

	var j = 0;

	for (var i = 0; i < p.partCount; i++, j+=p.PartObjectSize) {
		for (var inc = 0; inc < p.PartDim; inc++) {
			p.s1[j + inc + p.PartFLoc] += randrange(-this.coeff, this.coeff);
		}
	}


}