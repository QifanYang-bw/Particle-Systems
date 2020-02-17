// ==================== Wall CLimit ====================
var AxisDampenWall = function(axisType, axisPos, facing, bounciness = 1.0) { 

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

AxisDampenWall.prototype = Object.create(CLimit.prototype);
AxisDampenWall.prototype.constructor = AxisDampenWall;

AxisDampenWall.prototype.__applyLimit = function(p) {

	var j = 0;

	for (var i = 0; i < p.partCount; i++, j+=p.PartObjectSize) {

		loc = j + p.PartPosLoc + this.inc;
		loc2 = j + p.PartVelLoc + this.inc;

		// if (this.pos == 0 && this.inc == 2) {
		// 	console.log(p.s2[loc2])
		// }
		
		if (this.facing == '-' && p.s2[loc2] > 0 && p.s2[loc] > this.pos ||
			this.facing == '+' && p.s2[loc2] < 0 && p.s2[loc] < this.pos) {

			p.s2[loc] = this.pos;
			p.s2[loc2] = 0;

			// console.log(p.s2[loc2])

		}

	}

}