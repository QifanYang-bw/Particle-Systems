function solverLib() {}

solverLib.Explicit = function (obj) {
	// Find next state (Euler/Explicit: s2 = s1+ h*s1dot)

	var t = g_timeStep * 0.001;

	for (var i = 0; i < obj.totalLength; i++) {
		obj.s2[i] = obj.s1[i] + obj.s1dot[i] * t;
	}

}

solverLib.Implicit = function (obj) {
	// Find next state (implicit: s2 = s1+ h*s2dot)

	var t = g_timeStep * 0.001;
	var j = 0;

	for (var i = 0; i < obj.partCount; i++, j+=obj.PartObjectSize) {

		for (var inc = 0; inc < obj.PartDim; inc++) {
			var tinc = j + inc;
			// Position is calculated last after Velocity 
			obj.s2[obj.PartVelLoc + tinc] = obj.s1[obj.PartVelLoc + tinc] + obj.s1dot[obj.PartVelLoc + tinc] * t;
			// The stable trick!
			obj.s2[obj.PartPosLoc + tinc] = obj.s1[obj.PartPosLoc + tinc] + obj.s2[obj.PartVelLoc + tinc] * t;
		}

		for (var inc = obj.PartPosVelNext; inc < obj.PartObjectSize; inc++) {
			obj.s2[j + inc] = obj.s1[j + inc] + obj.s1dot[j + inc] * t;
		}
	}

}
