function CLimit() {
	this.enabled = true;
}

CLimit.prototype.applyLimit = function() {
	if (this.enabled) {
		this.__applyLimit();
	}
}


// ==================== Wall CLimit ====================
var AxisWall = function(axisType, axisPos, facing, bounciness = 1.0) { 

	CForcer.call(this);

	if (axisType == 'x') {
		this.inc = 0;
	}
	else if (axisType == 'y') {
		this.inc = 1;
	}
	else if (axisType == 'z') {
		this.inc = 2;
	}
	else {
		throw new Error(
			'axisType ' + axisType + ' doesn\'t exist!'
		);
	}

	this.pos = axisPos;
	this.facing = facing;
	this.bounciness = bounciness;

}

AxisWall.prototype = Object.create(CForcer.prototype);
AxisWall.prototype.constructor = AxisWall;

AxisWall.prototype.applyLimit = function(p) {

	var j = 0;

	for (var i = 0; i < p.partCount; i++, j+=PartObjectSize) {

		loc = j + PartPosLoc + this.inc;
		loc2 = j + PartVelLoc + this.inc;

		// if (this.pos == 0 && this.inc == 2) {
		// 	console.log(p.s2[loc2])
		// }
		
		if (this.facing == '-' && p.s2[loc2] > 0 && p.s2[loc] > this.pos ||
			this.facing == '+' && p.s2[loc2] < 0 && p.s2[loc] < this.pos) {

			p.s2[loc] = this.pos;
			p.s2[loc2] = -p.s2[loc2] * this.bounciness;

			// console.log(p.s2[loc2])

		}

	}

}
