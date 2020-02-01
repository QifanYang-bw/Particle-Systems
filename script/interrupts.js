// ----------------------- Consts -------------------------
var currentAngle = 0.0;
var eyeX = 5.001, eyeY = 5.001, eyeZ = 1.001; 
// var focalEyeX = 0, focalEyeY = 0, focalEyeZ = .5;  
var lookAtX = 0.0, lookAtY = 0.0, lookAtZ = 1.00;
var tX = 0, tY = 0, tZ = 0;
var dCamMove = 0.15;
var dCamRotate = 0.01;
var JUDGE = -1;

//===================Mouse and Keyboard event-handling Callbacks================
//==============================================================================
function myMouseDown(ev) {
//==============================================================================
// Called when user PRESSES down any mouse button;
// 									(Which button?    console.log('ev.button='+ev.button);   )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									  // x==0 at canvas left edge
  var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
	
	isDrag = true;											// set our mouse-dragging flag
	xMclik = x;													// record where mouse-dragging began
	yMclik = y;
		document.getElementById('MouseResult1').innerHTML = 
	'myMouseDown() at CVV coords x,y = '+x+', '+y+'<br>';
};


function myMouseMove(ev) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

	if(isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'

	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									  // x==0 at canvas left edge
	var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
	yMdragTot += (y - yMclik);
	xMclik = x;													// Make next drag-measurement from here.
	yMclik = y;
// (? why no 'document.getElementById() call here, as we did for myMouseDown()
// and myMouseUp()? Because the webpage doesn't get updated when we move the 
// mouse. Put the web-page updating command in the 'draw()' function instead)
};

function myMouseUp(ev) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									  // x==0 at canvas left edge
	var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
	
	isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	xMdragTot += (x - xMclik);
	yMdragTot += (y - yMclik);
	console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
	// Put it on our webpage too...
	document.getElementById('MouseResult1').innerHTML = 
	'myMouseUp(       ) at CVV coords x,y = '+x+', '+y+'<br>';
};


function myKeyDown(ev) {
//==============================================================================
// Called when user presses down ANY key on the keyboard, and captures the 
// keyboard's scancode or keycode (varies for different countries and alphabets).
//  CAUTION: You may wish to avoid 'keydown' and 'keyup' events: if you DON'T 
// need to sense non-ASCII keys (arrow keys, function keys, pgUp, pgDn, Ins, 
// Del, etc), then just use the 'keypress' event instead.
//	 The 'keypress' event captures the combined effects of alphanumeric keys and 
// the SHIFT, ALT, and CTRL modifiers.  It translates pressed keys into ordinary
// ASCII codes; you'll get uppercase 'S' if you hold shift and press the 's' key.
//
// For a light, easy explanation of keyboard events in JavaScript,
// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
// For a thorough explanation of the messy way JavaScript handles keyboard events
// see:    http://javascript.info/tutorial/keyboard-events
//

/*
	switch(ev.keyCode) {			// keycodes !=ASCII, but are very consistent for 
	//	nearly all non-alphanumeric keys for nearly all keyboards in all countries.
		case 37:		// left-arrow key
			// print in console:
			console.log(' left-arrow.');
			// and print on webpage in the <div> element with id='Result':
  		document.getElementById('KeyResult').innerHTML =
  			' Left Arrow:keyCode='+ev.keyCode;
			break;
		case 38:		// up-arrow key
			console.log('   up-arrow.');
  		document.getElementById('KeyResult').innerHTML =
  			'   Up Arrow:keyCode='+ev.keyCode;
			break;
		case 39:		// right-arrow key
			console.log('right-arrow.');
  		document.getElementById('KeyResult').innerHTML =
  			'Right Arrow:keyCode='+ev.keyCode;
  		break;
		case 40:		// down-arrow key
			console.log(' down-arrow.');
  		document.getElementById('KeyResult').innerHTML =
  			' Down Arrow:keyCode='+ev.keyCode;
  		break;
		default:
			console.log('myKeyDown()--keycode=', ev.keyCode, ', charCode=', ev.charCode);
  		document.getElementById('KeyResult').innerHTML =
  			'myKeyDown()--keyCode='+ev.keyCode;
			break;
	}
*/
}

function myKeyUp(ev) {
//==============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well
// You probably don't want to use this ('myKeyDown()' explains why); you'll find
// myKeyPress() can handle nearly all your keyboard-interface needs.
/*
	console.log('myKeyUp()--keyCode='+ev.keyCode+' released.');
*/
}

function myKeyPress(kev) {
//==============================================================================
// Best for capturing alphanumeric keys and key-combinations such as 
// CTRL-C, alt-F, SHIFT-4, etc.  Use this instead of myKeyDown(), myKeyUp() if
// you don't need to respond separately to key-down and key-up events.
/*
	// Report EVERYTHING about this pressed key in the console:
	console.log('myKeyPress():keyCode='+ev.keyCode  +', charCode=' +ev.charCode+
												', shift='    +ev.shiftKey + ', ctrl='    +ev.ctrlKey +
												', altKey='   +ev.altKey   +
												', metaKey(Command key or Windows key)='+ev.metaKey);
*/
  // RESET our g_timeStep min/max recorder:
  g_timeStepMin = g_timeStep;
  g_timeStepMax = g_timeStep;
  myChar = String.fromCharCode(kev.keyCode);	//	convert code to character-string
	// Report EVERYTHING about this pressed key in the webpage 
	// in the <div> element with id='Result':r 
/*  document.getElementById('KeyResult').innerHTML = 
   			'char= ' 		 	+ myChar 			+ ', keyCode= '+ ev.keyCode 	+ 
   			', charCode= '+ ev.charCode + ', shift= '	 + ev.shiftKey 	+ 
   			', ctrl= '		+ ev.shiftKey + ', altKey= ' + ev.altKey 		+ 
   			', metaKey= '	+ ev.metaKey 	+ '<br>' ;
*/  			
  // update particle system state? g_myRunMode 0=reset; 1= pause; 2=step; 3=run
	switch(myChar) {

		// ========================= Physics =========================
		case '0':	
			g_myRunMode = 0;			// RESET!
			break;
		case '1':
			g_myRunMode = 1;			// PAUSE!
			break;
		case '2':
			g_myRunMode = 2;			// STEP!
			break;
		case '3':							// RUN!
			g_myRunMode = 3;
			break;
		// case 'b':							// Toggle floor-bounce constraint type:
		// case 'B':
		// 	if(g_bounce==0) g_bounce = 1;
		// 	else g_bounce = 0;
		// 	break;
		// case 'c':					// 'c' or 'C' key:  toggle screen clearing
		// case 'C':					// to demonstrate 'trails'.
		// 	if(isClear == 0) isClear = 1;
		// 	else isClear = 0;
		// 	break;
		// case 'd':			// REDUCE drag;  make velocity scale factor rise towards 1.0
		// 	g_drag *= 1.0 / 0.995; 
		// 	if(g_drag > 1.0) g_drag = 1.0;	// don't allow drag to ADD energy!
		// 	break;
		// case 'D':			// INCREASE drag: make velocity scale factor a smaller fraction
		// 	g_drag *= 0.995;				
		// 	break;
		// case 'g':			// REDUCE gravity
		// 	g_grav *= 0.99;		// shrink 1%
		// 	break;
		// case 'G':
		// 	g_grav *= 1.0/0.98;	// grow by 2%
		// 	break;
		// case 'm':
		// 	g_mass *= 0.98;		// reduce mass by 2%
		// 	break;
		// case 'M':
		// 	g_mass *= 1.0/0.98;	// increase mass by 2%
		// 	break;
		case 'R':  // HARD reset: position AND velocity.
		  g_myRunMode = 0;			// RESET!
			// xposNow =  0.0;				yposNow =  0.0;				zposNow =  0.0;	
			// xvelNow =  INIT_VEL;	yvelNow =  INIT_VEL;	zvelNow =  0.0;
			break;
		case 'r':		// 'refresh' -- boost velocity only; return to 'run'
		  g_myRunMode = 3;  // RUN!
			// if(xvelNow > 0.0) xvelNow += INIT_VEL; else xvelNow -= INIT_VEL;
			// if(yvelNow > 0.0) yvelNow += 0.9*INIT_VEL; else yvelNow -= 0.9*INIT_VEL;

  		defaultVec.addRandVelocityToAll(
        0.2 * INIT_VEL, INIT_VEL, 
        0.2 * INIT_VEL, INIT_VEL,
        0.2 * INIT_VEL, INIT_VEL
      );

			break;	
		// case 's':
		// case 'S':
		// 	// switch to a different solver:
		// 	if(g_solver == 0) g_solver = 1;
		// 	else g_solver = 0;
		// 	break;
		// case 'p':
		// case 'P':			// toggle pause/run:
		// 	if(g_myRunMode == 3) g_myRunMode = 1;		// if running, pause
		// 							    else g_myRunMode = 3;		// if paused, run.
		// 	break;
		// case ' ':			// space-bar: single-step
		// 	g_myRunMode = 2;
		// 	break;

		default:
			console.log('myKeyPress(): Ignored key: '+myChar);
			break;
	}

  // Camera Update

  var dx = lookAtX - eyeX, dy = lookAtY - eyeY, dz = lookAtZ - eyeZ;
  var focal = Math.sqrt(dx*dx + dy*dy + dz*dz);
  var lzx = Math.sqrt(dx*dx+dy*dy);
  var sin_phi = lzx / focal;

  var theta0 = Math.PI -  Math.asin(dx/lzx);
  var cos_theta = dy / Math.sqrt(dx*dx + dy*dy);
  var sin_theta = dx / Math.sqrt(dx*dx + dy*dy);

  var lookAtHorizontalMultiplier = 2.0;

  var phi0 = Math.asin(dz/focal);

  switch(kev.code) {

    // case "KeyP":
    //   console.log("Pause/unPause!\n");                // print on console,
    //   // document.getElementById('KeyDownResult');   // print on webpage
    //   runStop();

    //   break;

    case "KeyD": { // d
            u = new Float32Array([0, 0, 1]);
            
            l = new Vector3();
            
            l[0] = dx/focal; l[1] = dy/focal; l[2] = dz/focal;

            t = new Vector3();
            t[0] = u[1]*l[2] - u[2]*l[1];
            t[1] = u[2]*l[0] - u[0]*l[2];
            t[2] = u[0]*l[1] - u[1]*l[0];

            var dist = Math.sqrt(t[0]*t[0] + t[1]*t[1] + t[2]*t[2]);

            t[0] /= dist; t[1] /= dist; t[2] /= dist;

            eyeX -= dCamMove * t[0];
            eyeY -= dCamMove * t[1];
            eyeZ -= dCamMove * t[2];

            lookAtX -= dCamMove * t[0];
            lookAtY -= dCamMove * t[1];
            lookAtZ -= dCamMove * t[2];

            break;
    }
    case "KeyA": { // a
            u = new Float32Array([0, 0, 1]);
            
            l = new Vector3();
            l[0] = dx/focal; l[1] = dy/focal; l[2] = dz/focal;

            t = new Vector3();
            t[0] = u[1]*l[2] - u[2]*l[1];
            t[1] = u[2]*l[0] - u[0]*l[2];
            t[2] = u[0]*l[1] - u[1]*l[0];

            var dist = Math.sqrt(t[0]*t[0] + t[1]*t[1] + t[2]*t[2]);

            t[0] /= dist; t[1] /= dist; t[2] /= dist;

            eyeX += dCamMove * t[0];
            eyeY += dCamMove * t[1];
            eyeZ += dCamMove * t[2];

            lookAtX += dCamMove * t[0];
            lookAtY += dCamMove * t[1];
            lookAtZ += dCamMove * t[2];

            break;
    } 
    case "KeyW": 
           { 
            t = new Vector3();
            t[0] = dx/focal; t[1] = dy/focal; t[2] = dz/focal;

            eyeX += dCamMove * t[0];
            eyeY += dCamMove * t[1];
            eyeZ += dCamMove * t[2];

            lookAtX += dCamMove * t[0];
            lookAtY += dCamMove * t[1];
            lookAtZ += dCamMove * t[2];

            break;
    } 
    case "KeyS": { 
            t = new Vector3();
            t[0] = dx/focal; t[1] = dy/focal; t[2] = dz/focal;
            
            eyeX -= dCamMove * t[0];
            eyeY -= dCamMove * t[1];
            eyeZ -= dCamMove * t[2];

            lookAtX -= dCamMove * t[0];
            lookAtY -= dCamMove * t[1];
            lookAtZ -= dCamMove * t[2];

            break;
    } 
    case "KeyI":{ 
            if (JUDGE==-1 || JUDGE==1)
            {  
              PHI_NOW = phi0 + dCamRotate;
              JUDGE = 0;
            }
            else
            {
              PHI_NOW += dCamRotate;
            }

            lookAtX = focal * Math.cos(PHI_NOW) * sin_theta + eyeX;
            lookAtY = focal * Math.cos(PHI_NOW) * cos_theta + eyeY;
            lookAtZ = focal * Math.sin(PHI_NOW) + eyeZ;

            break;
    }
    case "KeyK":{ 
            if(JUDGE == -1 || JUDGE == 1)
            { 
              PHI_NOW = phi0 - dCamRotate;  
              JUDGE = 0;
            }
            else
            {
              PHI_NOW -= dCamRotate;
            }

            lookAtX = focal * Math.cos(PHI_NOW) * sin_theta + eyeX;
            lookAtY = focal * Math.cos(PHI_NOW) * cos_theta + eyeY;
            lookAtZ = focal * Math.sin(PHI_NOW) + eyeZ;

            break;
    }
    case "KeyJ":{ 
          if(JUDGE==-1 || JUDGE==0)
            {
              THETA_NOW = theta0 + dCamRotate * lookAtHorizontalMultiplier;          
              JUDGE = 1;
            }
            else
            {
              THETA_NOW -= dCamRotate * lookAtHorizontalMultiplier;
            }

            lookAtX = focal * sin_phi * Math.sin(THETA_NOW) + eyeX;
            lookAtY = focal * sin_phi * Math.cos(THETA_NOW) + eyeY;
            lookAtZ = dz + eyeZ;
            
            break;
    }
    case "KeyL": {
            if (JUDGE == -1 || JUDGE == 0)
            {
              THETA_NOW = theta0 - dCamRotate * lookAtHorizontalMultiplier;
              JUDGE = 1;
            }
            else
            {
              THETA_NOW += dCamRotate * lookAtHorizontalMultiplier;
            }

            lookAtX = focal * sin_phi * Math.sin(THETA_NOW) + eyeX;
            lookAtY = focal * sin_phi * Math.cos(THETA_NOW) + eyeY;
            lookAtZ = dz + eyeZ;

            break;
    }
  }

}

function displayMe() {
//==============================================================================
// Print current state of the particle system on the webpage:
	var recipTime = 1000.0 / g_timeStep;			// to report fractional seconds
	var recipMin  = 1000.0 / g_timeStepMin;
	var recipMax  = 1000.0 / g_timeStepMax; 
	var solvType;												// convert solver number to text:
	if(g_solver==0) solvType = 'Explicit--(unstable!)<br>';
	else 						solvType = 'Implicit--(stable)<br>'; 
	var bounceType;											// convert bounce number to text
	if(g_bounce==0) bounceType = 'Velocity Reverse(no rest)<br>';
	else 						bounceType = 'Impulsive (will rest)<br>';
	var xvLimit = xvelNow;							// find absolute values of xvelNow
	if(xvelNow < 0.0) xvLimit = -xvelNow;
	var yvLimit = yvelNow;							// find absolute values of yvelNow
	if(yvelNow < 0.0) yvLimit = -yvelNow;
	var zvLimit = zvelNow;							// find absolute values of yvelNow
	if(zvelNow < 0.0) zvLimit = -zvelNow;
	
	document.getElementById('KeyResult').innerHTML = 
   			'<b>Solver = </b>' + solvType + 
   			'<b>Bounce = </b>' + bounceType +
   			'<b>drag = </b>' + g_drag.toFixed(5) + 
   			', <b>grav = </b>' + g_grav.toFixed(5) +
   			' m/s^2; <b>xVel = +/-</b> ' + xvLimit.toFixed(5) + 
   			' m/s; <b>yVel = +/-</b> ' + yvLimit.toFixed(5) + 
   			' m/s; <b>zVel = +/-</b> ' + zvLimit.toFixed(5) + 
   			' m/s;<br><b>timeStep = </b> 1/' + recipTime.toFixed(3) + ' sec' +
   			                ' <b>min:</b> 1/' + recipMin.toFixed(3)  + ' sec' + 
   			                ' <b>max:</b> 1/' + recipMax.toFixed(3)  + ' sec<br>' +
   			'';//' <b>s1Array: </b>' + partVec.s1 ;

    // console.log(partVec.s1);

}

function printBall() {
//==============================================================================
// Print current and previous position and velocity on console.
// Do you see why formally-defined states s0 and s1 are so helpful?
// It's far too easy to confuse 'current' and 'previous' values!

}


function onPlusButton() {
//==============================================================================
	INIT_VEL *= 1.2;		// increase
	console.log('Initial velocity: '+INIT_VEL);
}

function onMinusButton() {
//==============================================================================
	INIT_VEL /= 1.2;		// shrink
	console.log('Initial velocity: '+INIT_VEL);
}
