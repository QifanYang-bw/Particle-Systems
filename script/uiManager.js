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
	f1.add(settings, 'Flocks');
	f1.add(settings, 'Flame');
	f1.add(settings, 'Springs');

	var fSolver = gui.add(settings, 'Solver', { Explicit: 0, Implicit: 1 } );

	// var f1 = gui.addFolder('Rendering');
	// f1.add(settings, 'vertexShader', { Phong: 0, Gouraud: 1 } );
	// f1.add(settings, 'fragmentShader', { Phong: 0, Blinn_Phong: 1 } );


	// var fLamps = [];

	// fLamps[i] = gui.addFolder('HeadLight');

	// var thisLight = settings.lightSource[0];

	// fLamps[i].add(thisLight, 'isLit');
	// fLamps[i].addColor(thisLight, 'ambient');
	// fLamps[i].addColor(thisLight, 'diffusal');
	// fLamps[i].addColor(thisLight, 'specular');

	// for (var i = 1; i < lightSourceCount; i++) {

	// 	fLamps[i] = gui.addFolder('Light #' + i);

	// 	thisLight = settings.lightSource[i];

	// 	fLamps[i].add(thisLight, 'isLit');
	// 	fLamps[i].add(thisLight, 'x');
	// 	fLamps[i].add(thisLight, 'y');
	// 	fLamps[i].add(thisLight, 'z');

	// 	fLamps[i].addColor(thisLight, 'ambient');
	// 	fLamps[i].addColor(thisLight, 'diffusal');
	// 	fLamps[i].addColor(thisLight, 'specular');

	// }

	f1.open();
}

var SettingsManager = function() {

	this.ForceField = false;
	this.Flocks = false;
	this.Flame = true;
	this.Springs = false;

	this.Solver = 1;
};

// SettingsManager.prototype.apply = function() {

// 	if (this.Flame) {
// 		initBoxes(VboSplatter);
// 	} else if (this.Springs) {
// 		initBoxes(VboMultiSpring);
// 	} else {
// 		initBoxes(null);
// 	}

// }
