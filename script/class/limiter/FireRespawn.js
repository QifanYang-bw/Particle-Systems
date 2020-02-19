// ==================== Fountain Respawn CLimit ====================
var FireRespawn = function(
	ageLimit,
	spawnPos,
) { 

	CForcer.call(this);

	this.spawnPos = spawnPos;
	this.ageLimit = ageLimit;

	this.spawnAreaMin = [-.1, -.1, -.25];
	this.spawnAreaMax = [.1, .1, .25];

	this.spawnVelMin = [-.5, -.5, .8];
	this.spawnVelMax = [.5, .5, 1.6];

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

	var t = g_timeStep * 0.001;
	
	for (var i = 0; i < p.partCount; i++, j+=p.PartObjectSize) {

		if (p.s2[j + p.PartAgeSingle] > this.ageLimit) {
			// Remove the particle by 'respawning' it
			// console.log('respawning');

			p.s2[j + p.PartAgeSingle] = randrange(0, this.ageLimit);

			for (var inc = 0; inc < p.PartDim; inc++) {

				p.s2[p.PartPosLoc + j + inc] = this.spawnPos[inc] + randrange(this.spawnAreaMin[inc], this.spawnAreaMax[inc]);
				p.s2[p.PartVelLoc + j + inc] = randrange(
					this.spawnVelMin[inc],
					this.spawnVelMax[inc]
				);
				
			}

			for (var inc = 0; inc < p.PartColorDim; inc++) {
				p.s2[p.PartColorLoc + j + inc] = this.spawnColor[inc];
				p.s1dot[p.PartColorLoc + j + inc] = (this.dyingColor[inc] - this.spawnColor[inc]) / p.s2[j + p.PartAgeSingle];// * randrange(0.8, 1.2);
			}

			if (solverFunc == solverLib.Verlet) {
				// Special, Temporary reverse solver for Verlet
				// Verlet really messes up things...

				console.log('hi');

				for (var inc = 0; inc < p.PartDim; inc++) {
					p.s3[p.PartPosLoc + j + inc] = p.s2[p.PartPosLoc + j + inc] - p.s2[p.PartVelLoc + j + inc] * t;
				}
			}
			// console.log(p.s2.slice(j, j + p.PartObjectSize));

		}

	}

}
