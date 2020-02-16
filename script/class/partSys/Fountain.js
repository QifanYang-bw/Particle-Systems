var Fountain = function() { 

	// console.log(arguments);
	PartSys.apply(this, arguments);

	// Fountain-only properties
	this.PartAgeSingle = this.PartObjectSize;
	
	this.PartObjectSize += 1;

	this.ageScaler = 1;
	// this.ageLimit = 6;
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
