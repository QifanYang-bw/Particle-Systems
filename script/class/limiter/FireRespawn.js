// ==================== Fountain Respawn CLimit ====================
var FireRespawn = function(
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
		this.spawnVelMin = [-2, -2, 2];

	if (spawnVelMax != null)
		this.spawnVelMax = spawnVelMax;
	else
		this.spawnVelMax = [2, 2, 4];

	this.spawnColor = RGBIntToFloat([255, 221, 0]);
	this.spawnColor.push(1.0);

	this.dyingColor = RGBIntToFloat([255, 0, 0]);
	this.dyingColor.push(1.0);
}

FireRespawn.prototype = Object.create(CLimit.prototype);
FireRespawn.prototype.constructor = FireRespawn;

FireRespawn.prototype.__applyLimit = function(p) {

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

			for (var inc = 0; inc < p.PartColorDim; inc++) {
				p.s2[p.PartColorLoc + j + inc] = this.spawnColor[inc];
				p.s1dot[p.PartColorLoc + j + inc] = (this.dyingColor[inc] - this.spawnColor[inc]) / p.s2[j + p.PartAgeSingle];
			}

			// console.log(p.s2.slice(j, j + p.PartObjectSize));

		}

	}

}
