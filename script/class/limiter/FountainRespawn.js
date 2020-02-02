
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
