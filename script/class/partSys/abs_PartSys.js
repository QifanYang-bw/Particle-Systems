function randrange(min, max) {
  return Math.random() * (max - min) + min;
}

function PartSys() {

	/*
		Each particle object lies flat in the s1 array.
		One particle (CPart) object contains the following fields:
		(xpos, ypos, zpos, xvel, yvel, zvel, mass, xftot, yftot, zftot)
	*/

	// Const Definition

	this.__initialized = false;

	this.PartObjectSize = 11;

	this.PartPosDim = 4;
	this.PartDim = 3;

	this.PartPosLoc = 0;
	this.PartVelLoc = 4;
	this.PartMLocSingle = 7;
	this.PartFLoc = 8;

	// Initialization cannot be included due to possible inheritance

	// Temporarily Keeping the code
	// if (arguments.length > 0) {
	// 	console.log(arguments);
	// 	if (arguments.length != 3) {
	// 		throw new Error(
	// 			'init() requires three arguments (partCount, forceList, limitList)!'
	// 		);
	// 	}
	// 	this.init(arguments[0], arguments[1], arguments[2]);
	// } else {

	this.partCount = 0;

	// }


	// console.log('hi from partsys');

}

PartSys.prototype.init = function(partCount, forceList, limitList) {

	// console.log(arguments);

	if (arguments.length != 3) {
		throw new Error(
			'init() requires three arguments (partCount, forceList, limitList)!'
		);
	}

	this.partCount = arguments[0];
	this.totalLength = this.partCount * this.PartObjectSize;

	this.s1 = new Float32Array(this.totalLength);
	this.s1dot = new Float32Array(this.totalLength);
	this.s2 = new Float32Array(this.totalLength);

	this.forceList = arguments[1];
	this.limitList = arguments[2];

	// Setting the variable w in projection vector to 1
	var j = 0;
	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {
		this.s1[j + this.PartPosLoc + 3] = 1;
		this.s2[j + this.PartPosLoc + 3] = 1;
	}

	this.__initialized = true;

	// console.log(this.partCount);

}

PartSys.prototype.renderFrame = function() {

	if (!this.__initialized) {
		throw new Error('PartSys object not initialized!');
		return;
	}

    this.applyForces();
    this.dotFinder();
    this.solver();
    this.doConstraint();
    // this.render();
    this.swap();

}

PartSys.prototype.setRndPositions = function(xposMin, xposMax, yposMin, yposMax, zposMin, zposMax) {

	var j = 0;

	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {

		this.s1[j + this.PartPosLoc + 0] = randrange(xposMin, xposMax);
		this.s1[j + this.PartPosLoc + 1] = randrange(yposMin, yposMax);
		this.s1[j + this.PartPosLoc + 2] = randrange(zposMin, zposMax);

	}

}

PartSys.prototype.setRndMasses = function(massMin, massMax) {

	var j = 0;

	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {

		if (massMin == massMax) {
			this.s1[j + this.PartMLocSingle] = massMax;
		} else {
			this.s1[j + this.PartMLocSingle] = randint(massMin, massMax);
		}

	}

}

PartSys.prototype.setPosition = function(serial, xpos, ypos, zpos) {

	j = this.PartObjectSize * serial;

	this.s1[j + this.PartPosLoc + 0] = xpos;
	this.s1[j + this.PartPosLoc + 1] = ypos;
	this.s1[j + this.PartPosLoc + 2] = zpos;
}


PartSys.prototype.setMass = function(serial, mass) {

	j = this.PartObjectSize * serial;

	this.s1[j + this.PartMLocSingle] = mass;

}


PartSys.prototype.addVelocityToAll = function(xvel, yvel, zvel) {

	var j = 0;

	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {

		if (this.s1[j + this.PartVelLoc + 0] >= 0) this.s1[j + this.PartVelLoc + 0] += xvel;
										 else this.s1[j + this.PartVelLoc + 0] -= xvel;
		if (this.s1[j + this.PartVelLoc + 1] >= 0) this.s1[j + this.PartVelLoc + 1] += yvel;
										 else this.s1[j + this.PartVelLoc + 1] -= yvel;
		if (this.s1[j + this.PartVelLoc + 2] >= 0) this.s1[j + this.PartVelLoc + 2] += zvel;
										 else this.s1[j + this.PartVelLoc + 2] -= zvel;
	}

}

PartSys.prototype.addRandVelocityToAll = function(xvelMin, xvelMax, yvelMin, yvelMax, zvelMin, zvelMax) {

	var j = 0;

	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {

		if (this.s1[j + this.PartVelLoc + 0] >= 0)
			this.s1[j + this.PartVelLoc + 0] += randrange(xvelMin, xvelMax);
		else
			this.s1[j + this.PartVelLoc + 0] -= randrange(xvelMin, xvelMax);

		if (this.s1[j + this.PartVelLoc + 1] >= 0)
			this.s1[j + this.PartVelLoc + 1] += randrange(yvelMin, yvelMax);
		else
			this.s1[j + this.PartVelLoc + 1] -= randrange(yvelMin, yvelMax);

		if (this.s1[j + this.PartVelLoc + 2] >= 0)
			this.s1[j + this.PartVelLoc + 2] += randrange(zvelMin, zvelMax);
		else
			this.s1[j + this.PartVelLoc + 2] -= randrange(zvelMin, zvelMax);
	}

}

PartSys.prototype.applyForces = function() {

	// Use Forcer Set to find net forces Ftot on each particle in s1.
	// Done within CForcer object

	// Clear all Forces
	var j = 0;
	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {

		for (var inc = 0; inc < this.PartDim; inc++) {
			this.s1[this.PartFLoc + j + inc] = 0;
		}

	}

	for (var i = 0; i < this.forceList.length; i++) {
		this.forceList[i].applyForce(this);
	}

	// console.log('sep');
	// Calculates s1(xftot, yftot, zftot)
}

PartSys.prototype.dotFinder = function() {

	// Find s1dot by applying Newton’s laws to Ftot

	var j = 0;

	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {

		for (var inc = 0; inc < this.PartDim; inc++) {
			var tinc = j + inc;

			this.s1dot[this.PartPosLoc + tinc] = this.s1[this.PartVelLoc + tinc];

			// Assuming constant Mass
			// F = ma, a = F/m
			this.s1dot[this.PartVelLoc + tinc] = this.s1[this.PartFLoc + tinc] / this.s1[this.PartMLocSingle + j];

			if (Math.abs(this.s1dot[this.PartMLocSingle + j] - 0) > 1e-6) {
				this.s1dot[this.PartVelLoc + tinc] += this.s1dot[this.PartMLocSingle + j] * this.s1[this.PartVelLoc + tinc]
			}


		}
	}

	// Calculates this.s1dot
}

PartSys.prototype.solver = function() {

	// find next state (Euler/Explicit: s2 = s1+ h*s1dot)

	// console.log(this.s1);
	var t = g_timeStep * 0.001;

	// for (var i = 0; i < this.totalLength; i++) {

	// 	this.s2[i] = this.s1[i] + this.s1dot[i] * t;

	// }

	var j = 0;

	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {

		this.s2[this.PartMLocSingle + j] = this.s1[this.PartMLocSingle + j] + this.s1dot[this.PartMLocSingle + j] * t;

		for (var inc = 0; inc < this.PartDim; inc++) {
			var tinc = j + inc;

			// Position is calculated last after Velocity 

			this.s2[this.PartVelLoc + tinc] = this.s1[this.PartVelLoc + tinc] + this.s1dot[this.PartVelLoc + tinc] * t;

			// We don't need this for now:
			// this.s2[this.PartFLoc + tinc] = this.s1[this.PartFLoc + tinc] + this.s1dot[this.PartFLoc + tinc] * t;

			// The stable trick!

			this.s2[this.PartPosLoc + tinc] = this.s1[this.PartPosLoc + tinc] + this.s2[this.PartVelLoc + tinc] * t;

		}
	}

}

PartSys.prototype.doConstraint = function() {

	// apply LimitSet to s2: ‘bounce’ off walls, etc

	for (var i = 0; i < this.limitList.length; i++) {
		this.limitList[i].applyLimit(this);
	}

}

PartSys.prototype.render = function() {

	// depict s2 (& maybe Forcers & Limits) on-screen
	// pass until the shader is changed

}

PartSys.prototype.swap = function() {

	// Transfer contents of state vector s1 and s2

	var temp = this.s1;
	this.s1 = this.s2;
	this.s2 = temp;

}

PartSys.prototype.sampleParticleInfo = function(id = -1) {

	var sampleId;
	if (id == -1) {
		sampleId = Math.floor(randrange(0, this.partCount));
	}
	else
	{
		sampleId = id;
	}

	var startLoc = sampleId * this.PartObjectSize + this.PartPosLoc;
	console.log("Sample ID: ", sampleId);
	console.log("Sample Position: ", [this.s1[startLoc + 0], this.s1[startLoc + 1], this.s1[startLoc + 2]]);
}
