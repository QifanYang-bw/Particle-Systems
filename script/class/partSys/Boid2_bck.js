var Boid2 = function() { 

	PartSys.apply(this, arguments);

	this.speed = 1;

}

Boid2.prototype = Object.create(PartSys.prototype);
Boid2.prototype.constructor = Boid2;

Boid2.prototype.init = function() {
	PartSys.prototype.init.apply(this, arguments);

	var j = 0;
	for (var i = 0; i < this.partCount; i++, j+=this.PartObjectSize) {

		var vec = [randrange(-1, 1), randrange(-1, 1), randrange(-1, 1)]
        var dist = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);

        for (var inc = 0; inc < this.PartDim; inc++) {
			this.s1[this.PartVelLoc + j + inc] = vec[inc] / dist;
        }
	}

}

Boid2.prototype._isVecZero = function(v) {
	return Math.abs(v[0]) < 1e-6 && Math.abs(v[1]) < 1e-6 && Math.abs(v[2]) < 1e-6;
};

Boid2.prototype.solver = function() {
    // Unique Constant Velocity Solver for Boids

    var obj = this;

    var t = g_timeStep * 0.001;
    var j = 0;

    for (var i = 0; i < obj.partCount; i++, j+=obj.PartObjectSize) {

        var vec = [obj.s1[j + obj.PartFLoc + 0], obj.s1[j + obj.PartFLoc + 1], obj.s1[j + obj.PartFLoc + 2]];

        // var vec = [randrange(-1, 1), randrange(-1, 1), randrange(-1, 1)];

        if (this._isVecZero(vec)) {

	        // for (var inc = 0; inc < obj.PartDim; inc++) {
	        //     var tinc = j + inc;

	        //     obj.s2[obj.PartVelLoc + tinc] = obj.s1[obj.PartVelLoc + tinc];
	        //     obj.s2[obj.PartPosLoc + tinc] = obj.s1[obj.PartPosLoc + tinc] + obj.s2[obj.PartVelLoc + tinc] * t;
	        // }
	    var vec2 = [randrange(-1, 1), randrange(-1, 1), randrange(-1, 1)]
        var dist = Math.sqrt(vec2[0] * vec2[0] + vec2[1] * vec2[1] + vec2[2] * vec2[2]);

        for (var inc = 0; inc < this.PartDim; inc++) {
			this.s2[this.PartVelLoc + j + inc] = vec2[inc] / dist;
        }

        }
        else {
        	var dist2 = vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2];
	        var distRev = 1 / (Math.sqrt(dist2) + 1e-4);

	        // console.log(vec, distRev);
	        // console.log([vec[0] * distRev, vec[1] * distRev, vec[2] * distRev]);

	        for (var inc = 0; inc < obj.PartDim; inc++) {
	            var tinc = j + inc;

	            obj.s2[obj.PartVelLoc + tinc] = vec[inc] * distRev;

	            obj.s2[obj.PartPosLoc + tinc] = obj.s1[obj.PartPosLoc + tinc] + obj.s2[obj.PartVelLoc + tinc] * t;
	        }
        }
        // console.log([obj.s2[0], obj.s2[1], obj.s2[2]]);


    }

}