// ==================== Wall Abstract Class ====================
function CLimit() {
	this.enabled = true;
}

CLimit.prototype.applyLimit = function() {
	if (this.enabled) {
		this.__applyLimit.apply(this, arguments);
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

AxisWall.prototype = Object.create(CLimit.prototype);
AxisWall.prototype.constructor = AxisWall;

AxisWall.prototype.__applyLimit = function(p) {

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
			p.s2[loc2] = -p.s2[loc2] * this.bounciness;

			// console.log(p.s2[loc2])

		}

	}

}

// ==================== Fountain Respawn CLimit ====================
var FountainRespawn = function(
	ageLimit,
	spawnPos,
	spawnVelMin = null,
	spawnVelMax = null
) { 

	CForcer.call(this);

	this.spawnPos = spawnPos;
	this.ageLimit = ageLimit;

	if (spawnVelMin != null)
		this.spawnVelMin = spawnVelMin;
	else
		this.spawnVelMin = [-4, -4, 1];

	if (spawnVelMax != null)
		this.spawnVelMax = spawnVelMax;
	else
		this.spawnVelMax = [4, 4, 10];

}

FountainRespawn.prototype = Object.create(CLimit.prototype);
FountainRespawn.prototype.constructor = FountainRespawn;

FountainRespawn.prototype.__applyLimit = function(p) {

	if (typeof p.PartObjectSize == 'undefined') {
		throw new Error('partSys object has no age property!');
		return;
	}

	var j = 0;

	for (var i = 0; i < p.partCount; i++, j+=p.PartObjectSize) {

		if (p.s2[j + p.PartAgeSingle] > this.ageLimit) {
			// Remove the particle by 'respawning' it
			// console.log('respawning');

			p.s2[j + p.PartAgeSingle] = randrange(0, this.ageLimit);

			for (var inc = 0; inc < p.PartDim; inc++) {

				p.s2[p.PartPosLoc + j + inc] = this.spawnPos[inc];
				p.s2[p.PartVelLoc + j + inc] = randrange(
					this.spawnVelMin[inc],
					this.spawnVelMax[inc]
				);

			}

			// console.log(p.s2.slice(j, j + p.PartObjectSize));

		}

	}

}
