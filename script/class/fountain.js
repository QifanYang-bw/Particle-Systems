var Fountain = function() { 

	PartSys.call(this);

	// console.log('hi');

	// Fountain-only properties
	this.PartObjectSize = 11;
	this.PartAgeSingle = 10;

	this.ageScaler = 1;
	this.ageLimit = 6;
	// this.ageInitialized = false;

}

Fountain.prototype = Object.create(PartSys.prototype);
Fountain.prototype.constructor = Fountain;

Fountain.prototype.init = function() {
	PartSys.prototype.init.apply(this, arguments);

	var j = 0;
	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {
		// this.s1[this.PartAgeSingle + j] = randrange(0, this.ageScaler);
		this.s1dot[this.PartAgeSingle + j] = this.ageScaler;
	}

}

Fountain.prototype.setStatus = function(fRespawn) {

	var j = 0;
	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {
		this.s1[this.PartAgeSingle + j] = fRespawn.ageLimit + 1;
	}

	fRespawn.applyLimit(this);
}

Fountain.prototype.solver = function() {

	PartSys.prototype.solver.apply(this, arguments);

	var t = g_timeStep * 0.001;
	var j = 0;

	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {
		this.s2[this.PartAgeSingle + j] = this.s1[this.PartAgeSingle + j] + this.s1dot[this.PartAgeSingle + j] * t;
	}
	// console.log(this.s2[this.PartAgeSingle]);
}