// ==================== BoidBehaviour CForcer ====================
var BoidBehaviour = function() { 
	CForcer.call(this);

	this.effectDist = 0.5;

	this.p;
	this.coeff = 20;
}

BoidBehaviour.prototype = Object.create(CForcer.prototype);
BoidBehaviour.prototype.constructor = BoidBehaviour;

BoidBehaviour.prototype.__swapElement = function(i1, i2) {

	var temp;
	var loc1 = this.p.PartObjectSize * i1, loc2 = this.p.PartObjectSize * i2;

	for (var k = 0; k < this.p.PartObjectSize; k++) {
		temp = this.p.s1[loc1 + k];
		this.p.s1[loc1 + k] = this.p.s1[loc2 + k];
		this.p.s1[loc2 + k] = temp;
	}

}

BoidBehaviour.prototype.__comp = function(i) {
	// X axis
	return this.p.s1[this.p.PartObjectSize * i + this.p.PartPosLoc];
}

BoidBehaviour.prototype.__compl = function(loc) {
	// X axis
	return this.p.s1[loc];
}

BoidBehaviour.prototype._velDiffonIndex = function(i1, i2) {

    var i1loc = this.p.PartObjectSize * i1 + this.p.PartVelLoc;
    var i2loc = this.p.PartObjectSize * i2 + this.p.PartVelLoc;

    var vec = [this.p.s1[i1loc + 0] - this.p.s1[i2loc + 0], 
               this.p.s1[i1loc + 1] - this.p.s1[i2loc + 1],
               this.p.s1[i1loc + 2] - this.p.s1[i2loc + 2]];

    return vec;
}

BoidBehaviour.prototype.initialize = function(p) {

	this.p = p;
	this.__sorts1(p);

}

BoidBehaviour.prototype.__sorts1 = function(p) {
	// Bubble Sort
	for (var i = 0; i < p.partCount - 1; i++) {
		j = i;
		while (j < p.partCount - 1 && this.__comp(j) > this.__comp(j + 1)) {
			this.__swapElement(j, j + 1);
			j++;
		}
	}
}

BoidBehaviour.prototype.__applyForce = function(p) {

	// Use x axis as scanning dimension

	this.p = p;

	// Calculate Local Force
	// Assume Sorted

	var head = 0; tail = 1;

	for (var i = 0; i < p.partCount; i++) {

		var loci = p.PartObjectSize * i;

		while (head < p.partCount && this.__compl(loci) - this.__comp(head) > this.effectDist)
			head++;

		while (tail < p.partCount && this.__comp(tail) - this.__compl(loci) < this.effectDist)
			tail++;

		var fSepList = [0.0, 0.0, 0.0];
		var fAlignList = [0.0, 0.0, 0.0];
		var fCohList = [0.0, 0.0, 0.0];

		for (var j = head; j < tail; j++) {

			// Check
			if (j == i) continue;
			var dist = this._distonIndex(i, j);

			if (dist > this.effectDist) continue;

			// console.log(i, head, tail, dist);

			var locj = p.PartObjectSize * j;

			// Separation
			var vSep = this._veconIndex(i, j);
			var cSep = (this.effectDist - dist + 1e-4) / this.effectDist; // ... and Coeff

			for (var inc = 0; inc < p.PartDim; inc++) {
				fSepList[inc] += vSep[inc] / (dist + 1e-4) * cSep;
			}

			// Alignment
			var vAlign = this._velDiffonIndex(j, i);

			for (var inc = 0; inc < p.PartDim; inc++) {
				fAlignList[inc] += vAlign[inc];
			}

			// Cohesion
			
			var vCoh = this._veconIndex(j, i);
			for (var inc = 0; inc < p.PartDim; inc++) {
				fCohList[inc] += vCoh[inc];
			}

		}


		// var queueSize = tail - head;
		var dSep = this._distonVec(fSepList) + 1e-4;
		var dAlign = this._distonVec(fAlignList) + 1e-4;
		var dCoh = this._distonVec(fCohList) + 1e-4;

		for (var inc = 0; inc < p.PartDim; inc++) {
			p.s1[loci + p.PartFLoc] += (
				fSepList[inc] / dSep + 
				fAlignList[inc] / dAlign + 
				fCohList[inc] / dCoh
			) * 20;
		}

		if (i == 0) {
			// console.log(fSepList, fAlignList, fCohList);
		}

	}

	this.__sorts1(p);

}