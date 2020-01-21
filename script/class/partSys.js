// Const Definition

PartObjectSize = 10;
PartDim = 3;
PartPosLoc = 0;
PartVelLoc = 3;
PartMLocSingle = 6;
PartFLoc = 7;


function PartSys() {

	/*
		Each particle object lies flat in the s1 array.
		One particle (CPart) object contains the following fields:
		(xpos, ypos, zpos, xvel, yvel, zvel, mass, xftot, yftot, zftot)
	*/

	this.__initialized = false;

	if (arguments.length > 0) {

		console.log(arguments);

		if (arguments.length != 3) {
			throw new Error(
				'init() requires three arguments (partCount, forceList, limitList)!'
			);
		}

		this.init(arguments[0], arguments[1], arguments[2]);

	} else {

		this.partCount = 0;

	}

}

PartSys.prototype.init = function(partCount, forceList, limitList) {

	if (arguments.length != 3) {
		throw new Error(
			'init() requires three arguments (partCount, forceList, limitList)!'
		);
	}

	this.partCount = arguments[0];
	this.totalLength = this.partCount * PartObjectSize;

	this.s1 = new Float32Array(this.totalLength);
	this.s1dot = new Float32Array(this.totalLength);
	this.s2 = new Float32Array(this.totalLength);

	this.forceList = arguments[1];
	this.limitList = arguments[2];

	this.__initialized = true;

}

PartSys.prototype.setPosition = function(serial, xpos, ypos, zpos) {

	j = PartObjectSize * serial;

	this.s1[j + PartPosLoc + 0] = xpos;
	this.s1[j + PartPosLoc + 1] = ypos;
	this.s1[j + PartPosLoc + 2] = zpos;
}


PartSys.prototype.setMass = function(serial, mass) {

	j = PartObjectSize * serial;

	this.s1[j + PartMLocSingle] = mass;

}


PartSys.prototype.addVelocityToAll = function(xvel, yvel, zvel) {

	var j = 0;

	for (var i = 0; i < this.partCount; i++, j+=PartObjectSize) {

		if (this.s1[j + PartVelLoc + 0] >= 0) this.s1[j + PartVelLoc + 0] += xvel;
										 else this.s1[j + PartVelLoc + 0] -= xvel;
		if (this.s1[j + PartVelLoc + 1] >= 0) this.s1[j + PartVelLoc + 1] += yvel;
										 else this.s1[j + PartVelLoc + 1] -= yvel;
		if (this.s1[j + PartVelLoc + 2] >= 0) this.s1[j + PartVelLoc + 2] += zvel;
										 else this.s1[j + PartVelLoc + 2] -= zvel;
	}

}

PartSys.prototype.applyForces = function() {

	// Use Forcer Set to find net forces Ftot on each particle in s1.
	// Done within CForcer object

	if (!this.__initialized) 
		throw new Error('PartSys object not initialized!');

	// Clear all Forces
	var j = 0;
	for (var i = 0; i < this.partCount; i++, j+=PartObjectSize) {

		for (var inc = 0; inc < PartDim; inc++) {
			this.s1[PartFLoc + j + inc] = 0;
		}

	}

	for (var i = 0; i < this.forceList.length; i++) {
		this.forceList[i].applyForce(this);
	}

	// Calculates s1(xftot, yftot, zftot)
}

PartSys.prototype.dotFinder = function() {

	// Find s1dot by applying Newton’s laws to Ftot

	var j = 0;

	for (var i = 0; i < this.partCount; i++, j+=PartObjectSize) {

		for (var inc = 0; inc < PartDim; inc++) {
			var tinc = j + inc;

			this.s1dot[PartPosLoc + tinc] = this.s1[PartVelLoc + tinc];

			// Assuming constant Mass
			// F = ma, a = F/m
			this.s1dot[PartVelLoc + tinc] = this.s1[PartFLoc + tinc] / this.s1[PartMLocSingle + j];

			if (Math.abs(this.s1dot[PartMLocSingle + j] - 0) > 1e-6) {
				this.s1dot[PartVelLoc + tinc] += this.s1dot[PartMLocSingle + j] * this.s1[PartVelLoc + tinc]
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

	for (var i = 0; i < this.partCount; i++, j+=PartObjectSize) {

		this.s2[PartMLocSingle + j] = this.s1[PartMLocSingle + j] + this.s1dot[PartMLocSingle + j] * t;

		for (var inc = 0; inc < PartDim; inc++) {
			var tinc = j + inc;

			// Position is calculated last after Velocity 

			this.s2[PartVelLoc + tinc] = this.s1[PartVelLoc + tinc] + this.s1dot[PartVelLoc + tinc] * t;

			// We don't need this for now:
			// this.s2[PartFLoc + tinc] = this.s1[PartFLoc + tinc] + this.s1dot[PartFLoc + tinc] * t;

			// The stable trick!

			this.s2[PartPosLoc + tinc] = this.s1[PartPosLoc + tinc] + this.s2[PartVelLoc + tinc] * t;

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
