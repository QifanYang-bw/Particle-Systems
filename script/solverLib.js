function solverLib() {}

solverLib.dotFinder = function(obj, s1, s1dot) {

	// Find s1dot by applying Newton’s laws to Ftot

	var j = 0;

	for (var i = 0; i < obj.partCount; i++, j+=obj.PartObjectSize) {

		for (var inc = 0; inc < obj.PartDim; inc++) {
			var tinc = j + inc;

			s1dot[obj.PartPosLoc + tinc] = s1[obj.PartVelLoc + tinc];

			// Assuming constant Mass
			// F = ma, a = F/m
			s1dot[obj.PartVelLoc + tinc] = s1[obj.PartFLoc + tinc] / s1[obj.PartMLocSingle + j];

			if (obj.enableMassChange && Math.abs(s1dot[obj.PartMLocSingle + j] - 0) > 1e-6) {
				s1dot[obj.PartVelLoc + tinc] += s1dot[obj.PartMLocSingle + j] * s1[obj.PartVelLoc + tinc]
			}


		}
	}

}

solverLib.Explicit = function (obj) {
	// Find next state (Euler/Explicit: s2 = s1+ h*s1dot)

	solverLib.dotFinder(obj, obj.s1, obj.s1dot);

	var t = g_timeStep * 0.001;

	for (var i = 0; i < obj.totalLength; i++) {
		obj.s2[i] = obj.s1[i] + obj.s1dot[i] * t;
	}

}

solverLib.Implicit = function (obj) {
	// Find next state (implicit: s2 = s1+ h*s2dot)

	solverLib.dotFinder(obj, obj.s1, obj.s1dot);

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


solverLib.MidPoint = function (obj) {
	// Find next state (Midpoint/Runge-Kutta)

	solverLib.dotFinder(obj, obj.s1, obj.s1dot);

	var t = g_timeStep * 0.001;

	// sM = s1 + (h/2)*s1dot

	for (var i = 0; i < obj.totalLength; i++) {
		obj.s2[i] = obj.s1[i] + obj.s1dot[i] * t * .5;
	}

	obj.swap();
	obj.applyForces();
	obj.swap();

	solverLib.dotFinder(obj, obj.s2, obj.s2dot);

	for (var i = 0; i < obj.totalLength; i++) {
		obj.s2[i] = obj.s1[i] + obj.s2dot[i] * t;
	}
}


solverLib.IterativeEuler = function (obj) {
	// Find next state (Euler - Iterative)

	solverLib.dotFinder(obj, obj.s1, obj.s1dot);

	var t = g_timeStep * 0.001;

	// sM = s1 + h*s1dot

	for (var i = 0; i < obj.totalLength; i++) {
		obj.s2[i] = obj.s1[i] + obj.s1dot[i] * t;
	}

	obj.swap();
	obj.applyForces();
	obj.swap();

	solverLib.dotFinder(obj, obj.s2, obj.s2dot);

	// s3 = s2 - h*s2dot
	for (var i = 0; i < obj.totalLength; i++) {
		obj.s3[i] = obj.s2[i] - obj.s2dot[i] * t;
	}

	// sErr = s1 - s3 .....<- Why there is an h in the Position formula?
	// s2new = s2 + 0.5 * sErr

	var j = 0;

	for (var i = 0; i < obj.totalLength; i++) {
		obj.s2[i] += .5 * (obj.s1[i] - obj.s3[i]);
	}

}


solverLib.IterativeMidPoint = function (obj) {
	// Find next state (Midpoint - Iterative)

	solverLib.dotFinder(obj, obj.s1, obj.s1dot);

	var t = g_timeStep * 0.001;

	// ========== Midpoint ==========
	// Midpoint for s1

	// sM = s1 + (h/2)*s1dot
	for (var i = 0; i < obj.totalLength; i++) {
		obj.s2[i] = obj.s1[i] + obj.s1dot[i] * t * .5;
	}

	obj.swap();
	obj.applyForces();
	obj.swap();

	solverLib.dotFinder(obj, obj.s2, obj.s1dot);

	for (var i = 0; i < obj.totalLength; i++) {
		obj.s2[i] = obj.s1[i] + obj.s1dot[i] * t;
	}

	// Midpoint for s2

	obj.swap();
	obj.applyForces();
	obj.swap();
	
	// sM = s1 + (h/2)*s1dot
	for (var i = 0; i < obj.totalLength; i++) {
		obj.s3[i] = obj.s2[i] + obj.s2dot[i] * t * .5;
	}

	obj.swap3();
	obj.applyForces();
	obj.swap3();

	solverLib.dotFinder(obj, obj.s3, obj.s2dot);

	// ========== Midpoint End ==========


	// s3 = s2 - h*s2dot
	for (var i = 0; i < obj.totalLength; i++) {
		obj.s3[i] = obj.s2[i] - obj.s2dot[i] * t;
	}

	// sErr = s1 - s3 .....<- Why there is an h in the Position formula?
	// s2new = s2 + 0.5 * sErr

	var j = 0;

	for (var i = 0; i < obj.totalLength; i++) {
		obj.s2[i] += .5 * (obj.s1[i] - obj.s3[i]);
	}

}


solverLib.Verlet = function (obj) {
	// Find next state (Midpoint - Iterative)

	solverLib.dotFinder(obj, obj.s1, obj.s1dot);

	var t = g_timeStep * 0.001;

	var j = 0;
	// Pos: s2 = s1 + s1dot * h + .5 * s1dotdot * h * h

	for (var i = 0; i < obj.partCount; i++, j+=obj.PartObjectSize) {
		for (var inc = 0; inc < obj.PartDim; inc++ ) {

			obj.s2[j + obj.PartPosLoc + inc] =
				obj.s1[j + obj.PartPosLoc + inc] +
				obj.s1dot[j + obj.PartPosLoc + inc] * t +
				obj.s1dot[j + obj.PartVelLoc + inc] * t * t * .5;

		}
	}

	obj.swap();
	obj.applyForces();
	obj.swap();

	solverLib.dotFinder(obj, obj.s2, obj.s2dot);

	var j = 0;
	// Vel: s2 = s1 + .5 * (s1 + s2)

	for (var i = 0; i < obj.partCount; i++, j+=obj.PartObjectSize) {
		for (var inc = 0; inc < obj.PartDim; inc++ ) {
			obj.s2[j + obj.PartVelLoc + inc] =
				obj.s1dot[j + obj.PartPosLoc + inc] +
				(obj.s1dot[j + obj.PartVelLoc + inc] + obj.s2dot[j + obj.PartVelLoc + inc]) * t * .5
		}
	}

	// Patch up Everything else if there is
	var j = 0;
	for (var i = 0; i < obj.partCount; i++, j+=obj.PartObjectSize) {
		for (var inc = obj.PartPosVelNext; inc < obj.PartObjectSize; inc++) {
			obj.s2[j + inc] = obj.s1[j + inc] + obj.s1dot[j + inc] * t;
		}
	}
}