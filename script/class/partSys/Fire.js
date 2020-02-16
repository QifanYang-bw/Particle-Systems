var Fire = function() { 

	// console.log(arguments);
	PartSys.apply(this, arguments);

	// ====================== Fire-only properties ======================
	// Add Age
	this.PartAgeSingle = this.PartObjectSize;
	this.PartObjectSize += 1;
	this.ageScaler = 1;

	this.PartColorLoc = this.PartObjectSize;
	this.PartColorDim = 4;
	this.PartObjectSize += this.PartColorDim;

}

Fire.prototype = Object.create(PartSys.prototype);
Fire.prototype.constructor = Fire;

Fire.prototype.init = function() {
	PartSys.prototype.init.apply(this, arguments);

	var j = 0;
	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {
		this.s1dot[this.PartAgeSingle + j] = this.ageScaler;
	}

}

Fire.prototype.setStatus = function(fRespawn) {

	var j = 0;
	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {
		this.s1[this.PartAgeSingle + j] = fRespawn.ageLimit + 1;
	}

	fRespawn.applyLimit(this);
}
