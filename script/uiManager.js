var gui, settings;

function RGBIntToFloat(intArray) {
	if (intArray.length != 3) {
		console.log('function RGBIntToFloat only support vec3!')
	}

	return [intArray[0] / 255, intArray[1] / 255, intArray[2] / 255]
}

function RGBFloatToInt(floatArray) {
	if (floatArray.length != 3) {
		console.log('function RGBIntToFloat only support vec3!')
	}

	return [floatArray[0] * 255, floatArray[1] * 255, floatArray[2] * 255]
}

function initGUI() {

	gui = new dat.GUI({
	  // load: defaultSettings
	});
	settings = new SettingsManager();

	// gui.remember(settings);

	// for (var i = 0; i < lightSourceCount; i++) {
	// 	gui.remember(settings.lightSource[i]);
	// }

	var f1 = gui.addFolder('Particle Systems');
	f1.add(settings, 'ForceField');
	f1.add(settings, 'Boid');
	f1.add(settings, 'Flame');
	f1.add(settings, 'Springs');

	var fSolver = gui.add(settings, 'Solver', {
		Explicit: 0,
		SymplecticEuler: 1,
		MidPoint: 2,
		IterativeEuler: 3,
		IterativeMidPoint: 4,
		Verlet: 5,
		VelocityVerlet: 6,
		HeunsMethod: 7,
	} );

	var fCons = gui.addFolder('Constraints');

	var fSph = fCons.addFolder('Sphere');
	fSph.add(settings, 'sphereEnabled');
	fSph.add(settings, 'sphereX');
	fSph.add(settings, 'sphereY');
	fSph.add(settings, 'sphereZ');
	fSph.add(settings, 'sphereRad');

	var fCyl = fCons.addFolder('Cylinder');
	fCyl.add(settings, 'cylinderEnabled');
	fCyl.add(settings, 'cylinderX');
	fCyl.add(settings, 'cylinderY');
	fCyl.add(settings, 'cylinderZ');
	fCyl.add(settings, 'cylinderRad');
	fCyl.add(settings, 'cylinderHeight');


	var fForc = gui.addFolder('Forces');
	fForc.add(settings, 'sphForceEnabled');
	fForc.add(settings, 'sphForceX');
	fForc.add(settings, 'sphForceY');
	fForc.add(settings, 'sphForceZ');
	fForc.add(settings, 'sphForceMass');

	f1.open();
	fCons.open();
	fForc.open();
}

var SettingsManager = function() {

	this.ForceField = false;
	this.Boid = true;
	this.Flame = false;
	this.Springs = false;

	this.Solver = 1;

	this.sphereEnabled = false;
	this.sphereX = 0.0;
	this.sphereY = 0.0;
	this.sphereZ = 2.0;
	this.sphereRad = 1.2;

	this.cylinderEnabled = false;
	this.cylinderX = 0.0;
	this.cylinderY = 0.0;
	this.cylinderZ = 2.0;
	this.cylinderRad = 2.0;
	this.cylinderHeight = 4.0;

	this.sphForceEnabled = false;
	this.sphForceX = 0.0;
	this.sphForceY = 0.0;
	this.sphForceZ = 2.0;
	this.sphForceMass = 1.2;
};
