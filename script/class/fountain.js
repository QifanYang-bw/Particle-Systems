var Fountain = function() { 

	PartSys.call(this);

	// console.log('hi');

	// Fountain-only properties
	this.PartObjectSize = 11;
	
	this.PartAgeSingle = 10;

}

Fountain.prototype = Object.create(PartSys.prototype);
Fountain.prototype.constructor = Fountain;