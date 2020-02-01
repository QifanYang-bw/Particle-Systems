// ORIGINAL SOURCE:
// RotatingTranslatedTriangle.js (c) 2012 matsuda
// HIGHLY MODIFIED to make:
//
// Starter Code:
// BouncyBall.js  for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin
//
// Student Assignment by Qifan Yang, 2020

var gl;   // webGL Rendering Context.  Created in main(), used everywhere.
var g_canvas; // our HTML-5 canvas object that uses 'gl' for drawing.

var g_timeStep = 1000.0/60.0;     // current timestep (1/60th sec) in milliseconds
var g_timeStepMin = g_timeStep;   // min,max timestep values since last keypress.
var g_timeStepMax = g_timeStep;   // (initialized here)

var g_last = Date.now();        //  Timestamp: set after each frame of animation,
                                // used by 'animate()' function to find how much
                                // time passed since we last updated our canvas.
var g_stepCount = 0;            // Advances by 1 for each timestep, modulo 1000, 
                                // (0,1,2,3,...997,998,999,0,1,2,..) to identify 
                                // WHEN the ball bounces.  RESET by 'r' or 'R'.


// For keyboard, mouse-click-and-drag
var g_myRunMode = 3;	// particle system state: 0=reset; 1= pause; 2=step; 3=run

var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;   
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;  

var isClear = 1;		// 0 or 1 to enable or disable screen-clearing in the
//									// draw() function. 'C' or 'c' key toggles in myKeyPress().

//============================== WebGL Global Variables ===============================

// Temperal Solution; Need changing
var xposNow, yposNow, zposNow;

var vpMatrix;

var a_PositionID, u_runModeID, u_ballShiftID, u_MvpMatrixID;

var partBox, gridBox;

var defaultVec;

function main() {

//==============================================================================
  // Retrieve <canvas> element
  g_canvas = document.getElementById('webgl');
	gl = g_canvas.getContext("webgl", { preserveDrawingBuffer: true});
	// NOTE: this disables HTML-5's default screen-clearing, so that our draw() 
	// function will over-write previous on-screen results until we call the 
	// gl.clear(COLOR_BUFFER_BIT); function. )
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  
	// Register the Mouse & Keyboard Event-handlers-------------------------------
	// If users move, click or drag the mouse, or they press any keys on the 
	// the operating system will sense them immediately as 'events'.  
	// If you would like your program to respond to any of these events, you must 
	// tell JavaScript exactly how to do it: you must write your own 'event 
	// handler' functions, and then 'register' them; tell JavaScript WHICH 
	// events should cause it to call WHICH of your event-handler functions.
	//
	// First, register all mouse events found within our HTML-5 canvas:
	// when user's mouse button goes down call mouseDown() function,etc

  g_canvas.onmousedown	=	function(ev){myMouseDown(ev) }; 
  g_canvas.onmousemove = 	function(ev){myMouseMove(ev) };				
  g_canvas.onmouseup = 		function(ev){myMouseUp(  ev) };
  					// NOTE! 'onclick' event is SAME as on 'mouseup' event
  					// in Chrome Brower on MS Windows 7, and possibly other 
  					// operating systems; use 'mouseup' instead.

  // Next, register all keyboard events found within our HTML webpage window:
	window.addEventListener("keydown", myKeyDown, false);
	window.addEventListener("keyup", myKeyUp, false);
	window.addEventListener("keypress", myKeyPress, false);

  // The 'keyDown' and 'keyUp' events respond to ALL keys on the keyboard,
  // 			including shift,alt,ctrl,arrow, pgUp, pgDn,f1,f2...f12 etc. 
  //			I find these most useful for arrow keys; insert/delete; home/end, etc.
  // The 'keyPress' events respond only to alpha-numeric keys, and sense any 
  //  		modifiers such as shift, alt, or ctrl.  I find these most useful for
  //			single-number and single-letter inputs that include SHIFT,CTRL,ALT.
	// END Mouse & Keyboard Event-Handlers-----------------------------------

  // ============================= PartSys Init ===================================

  initBoxes();


  // ============================= Canvas Settings ===================================
	
  gl.clearColor(0.08, 0.08, 0.07, 1);    // RGBA color for clearing WebGL framebuffer
  // gl.clear(gl.COLOR_BUFFER_BIT);    // clear it once to set that color as bkgnd.

  gl.enable(gl.DEPTH_TEST);

	// Display (initial) particle system values on webpage
	// displayMe();

	
  // Quick tutorial on synchronous, real-time animation in JavaScript/HTML-5: 
  //  	http://creativejs.com/resources/requestanimationframe/
  //		--------------------------------------------------------
  // Why use 'requestAnimationFrame()' instead of the simple-to-use
  //	fixed-time setInterval() or setTimeout() functions?  Because:
  //		1) it draws the next animation frame 'at the next opportunity' instead 
  //			of a fixed time interval. It allows your browser and operating system
  //			to manage its own processes, power, and computing loads and respond to 
  //			on-screen window placement (skip battery-draining animation in any 
  //			window hidden behind others, or scrolled off-screen)
  //		2) it helps your program avoid 'stuttering' or 'jittery' animation
  //			due to delayed or 'missed' frames.  Your program can read and respond 
  //			to the ACTUAL time interval between displayed frames instead of fixed
  //		 	fixed-time 'setInterval()' calls that may take longer than expected.
  var tick = function() {
    g_timeStep = animate(); 
                      // find out how much time passed since last screen redraw.

    drawResize();
  	draw();    // compute new particle state at current time
    requestAnimationFrame(tick, g_canvas);
                      // Call us again 'at next opportunity' as seen by the
                      // HTML-5 element 'g_canvas'.
  };
  tick();
}

function initBoxes() {

  gridBox = new VboGrid();
  partBox = new VboParticles();

  gridBox.init();
  partBox.init();

  defaultVec = partBox.partVec;

}

function animate() {
//==============================================================================  
// How much time passed since we last updated the 'g_canvas' screen elements?
  var now = Date.now();	
  var elapsed = now - g_last;	
  g_last = now;
  g_stepCount = (g_stepCount +1)%1000;		// count 0,1,2,...999,0,1,2,...
  // Return the amount of time passed, in integer milliseconds
  if     (elapsed < g_timeStepMin) g_timeStepMin = elapsed;  // update min/max
  else if(elapsed > g_timeStepMax) g_timeStepMax = elapsed;
  return elapsed;
}

function draw() {
//============================================================================== 
  // Clear WebGL frame-buffer? (The 'c' or 'C' key toggles isClear between 0 & 1).
  if(isClear == 1) gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  {
    // *** SURPRISE! ***
    //  What happens when you forget (or comment-out) this gl.clear() call?
    // In OpenGL (but not WebGL), you'd see 'trails' of particles caused by drawing 
    // without clearing any previous drawing. But not in WebGL; by default, HTML-5 
    // clears the canvas to white (your browser's default webpage color).  To see 
    // 'trails' in WebGL you must disable the canvas' own screen clearing.  HOW?
    // -- in main() where we create our WebGL drawing context, 
    // replace this (default):
    // -- with this:
    // -- To learn more, see: 
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext

    // // update particle system state?
    //   if(   g_myRunMode > 1) {								// 0=reset; 1= pause; 2=step; 3=run
    // 		if(g_myRunMode == 2) myRunMode=1;			// (if 2, do just one step and pause.)
    // 		//=YES!=========================================
    // 		// Make our 'bouncy-ball' move forward by one timestep, but now the 's' key 
    // 		// will select which kind of solver to use:
    // 		if(g_solver==0) {
    // 		//-----------------------------------------------------------------------
    // 			// EXPLICIT or 'forward time' solver, as found in bouncyBall03.01BAD and
    // 			// bouncyBall04.01badMKS.  CAREFUL! this solver adds energy -- not stable
    // 			// for many particle system settings!
    // 			// This solver looks quite sensible and logical.  Formally, it's an 
    // 			//	explicit or 'forward-time' solver known as the Euler method:
    // 			//			Use the current velocity ('s0dot') to move forward by
    // 			//			one timestep: s1 = s0 + s0dot*h, and
    // 			//		-- Compute the new velocity (e.g. s1dot) too: apply gravity & drag.
    // 			//		-- Then apply constraints: check to see if new position (s1)
    // 			//			is outside our floor, ceiling, or walls, and if new velocity
    // 			//			will move us further in the wrong direction. If so, reverse it!
    // 			// CAREFUL! must convert g_timeStep from milliseconds to seconds!
    // 			xposPrev = xposNow;			// SAVE these values before we update them.
    // 			xvelPrev = xvelNow;			// (for use in constraint-applying code below).
    // 			yposPrev = yposNow;
    // 			yvelPrev = yvelNow;	
    // 			//------------------
    // 			// Compute new position from current position, current velocity, & timestep
    // 			xposNow += xvelNow * (g_timeStep * 0.001);
    // 			yposNow += yvelNow * (g_timeStep * 0.001); 
    // 			// -- apply acceleration due to gravity to current velocity:
    // 			// 					 yvelNow -= (accel. due to gravity)*(timestep in seconds) 
    // 			//									 -= (9.832 meters/sec^2) * (g_timeStep/1000.0);
    // 			yvelNow -= g_grav*(g_timeStep*0.001);
    // 			// -- apply drag: attenuate current velocity:
    // 			xvelNow *= g_drag;
    // 			yvelNow *= g_drag; 
    // 		// We're done!
    // 			//		**BUT***  IT DOESN"T WORK!?!? WHY DOES THE BALL NEVER STOP?
    // 			//	Multiple answers:
    // 			//	1a) Note how easily we can confuse these two cases (bouncyball03 vs 
    // 			//		bouncyball03.01) unless we're extremely careful; one seemingly 
    // 			//		trivial mod to version 03 radically changes bouncyball behavior!
    // 			//		State-variable formulation prevents these confusions by strict 
    // 			//		separation of all parameters of the current state (s0) and the next 
    // 			//		state (s1), with an unambiguous 'swap' operation at the end of our 
    // 			//		animation loop (see lecture notes).
    // 			//	1b) bouncyball03.01 fails by using an 'explicit' solver, but the 
    // 			//		'weirdly out-of-order' bouncyBall03.js works. Why? because 
    // 			//		version03 uses a simple, accidental special case of an 'implicit' or 
    // 			//		'time-reversed' solver: it finds the NEXT timestep's velocity but 
    // 			//		applies it 'backwards in time' -- adds it to the CURRENT position! 
    // 			//				Implicit solvers (we'll learn much more about them soon) will
    // 			//		often work MUCH better that the simple and obvious Euler method (an  
    // 			//		explicit, 'forward-time' solver) because implicit solvers are 
    // 			//		'lossy': their  errors slow down the bouncy ball, cause it to lose 
    // 			//		more energy, acting as a new kind of 'drag' that helps stop the ball.
    // 			//		Conversely, errors from the 'sensible' Euler method always ADD 
    // 			//		energy to the bouncing ball, causing it to keep moving incessantly.
    // 			// 2) BAD CONSTRAINTS: simple velocity reversals aren't enough to 
    // 			//		adequately simulate collisions, bouncing, and resting contact on a 
    // 			//		solid wall or floor.  BOTH bouncyball03 AND bouncyball03.01BAD need 
    // 			//		improvement: read Chapter 7 in your book to learn the multi-step 
    // 			//		process needed, and why state-variable formulation is especially 
    // 			//		helpful.  For example, imagine that in the current timestep (s0) the 
    // 			//		ball is at rest on the floor with zero velocity.  During the time 
    // 			//		between s0 and s1, gravity will accelerate the ball downwards; it 
    // 			//		will 'fall through the floor'; thus our next state s1 is erroneous, 
    // 			//		and we must correct it.  To improve our floor and wall collision 
    // 			//		handling we must: 
    // 			//				1) 'resolve collision' -- in s1, re-position the ball at the 
    // 			//						surface of the floor, and 
    // 			//				2) 'apply impulse' -- in s1, remove the CHANGE in velocity 
    // 			//						caused by erroneous 'fall-through', 
    // 			//		and 3) 'bounce' -- reverse the velocity that remains, moving the
    // 			//						particle away from the collision at a velocity scaled by the 
    // 			//						floor's bouncy-ness (coefficient of restitution; see book).
    // 		}
    // 		else if(g_solver==1) {
    // 		//------------------------------------------------------------------------
    // 			// IMPLICIT or 'reverse time' solver, as found in bouncyBall04.goodMKS;
    // 			// This category of solver is often better, more stable, but lossy.
    // 			// -- apply acceleration due to gravity to current velocity:
    // 			//				  yvelNow -= (accel. due to gravity)*(g_timestep in seconds) 
    // 			//                  -= (9.832 meters/sec^2) * (g_timeStep/1000.0);
    // 			xposPrev = xposNow;			// SAVE these values before we update them.
    // 			xvelPrev = xvelNow;			// (for use in constraint-applying code below).
    // 			yposPrev = yposNow;
    // 			yvelPrev = yvelNow;
    // 			//-------------------
    // 			yvelNow -= g_grav*(g_timeStep*0.001);
    // 			// -- apply drag: attenuate current velocity:
    // 			xvelNow *= g_drag;
    // 			yvelNow *= g_drag;
    // 			// -- move our particle using current velocity:
    // 			// CAREFUL! must convert g_timeStep from milliseconds to seconds!
    // 			xposNow += xvelNow * (g_timeStep * 0.001);
    // 			yposNow += yvelNow * (g_timeStep * 0.001); 
    // 			// What's the result of this rearrangement?
    // 			//	IT WORKS BEAUTIFULLY! much more stable much more often...
    // 		}
    // 		else {
    // 			console.log('?!?! unknown solver: g_solver==' + g_solver);
    // 			return;
    // 		}

    // 		//==========================================================================
    // 		// CONSTRAINTS -- 'bounce' our ball off floor & walls at (0,0), (1.8, 1.8):
    // 		// where g_bounce selects constraint type:
    // 		// ==0 for simple velocity-reversal, as in all previous versions
    // 		// ==1 for Chapter 7's collision resolution method, which uses an 'impulse' 
    // 		//      to cancel any velocity boost caused by falling below the floor.
    // 		if(g_bounce==0) { //--------------------------------------------------------
    // 			if(      xposNow < 0.0 && xvelNow < 0.0			// simple velocity-reversal
    // 			) {		// bounce on left wall.
    // 				xvelNow = -g_resti*xvelNow;
    // 			}
    // 			else if (xposNow > 1.8 && xvelNow > 0.0
    // 			) {		// bounce on right wall
    // 				xvelNow = -g_resti*xvelNow;
    // 			}
    // 			if(      yposNow < 0.0 && yvelNow < 0.0
    // 			) {		// bounce on floor
    // 				yvelNow = -g_resti*yvelNow;
    // 			}
    // 			else if( yposNow > 1.8 && yvelNow > 0.0
    // 			) {		// bounce on ceiling
    // 				yvelNow = -g_resti*yvelNow;
    // 			}
    // 			//  -- hard limit on 'floor' keeps y position >= 0;
    // 			if(yposNow < 0.0) yposNow = 0.0;
    // 		}
    // 		else if (g_bounce==1) { //---------------------------------------------------------------------------
    // 			if(      xposNow < 0.0 && xvelNow < 0.0 // collision!  left wall...
    // 			) {		// bounce on left wall.

    // 				xposNow = 0.0;

    // 				xvelNow = xvelPrev;
    // 				xvelNow *= g_drag;

    // 				if(xvelNow < 0.0) xvelNow = -g_resti*xvelNow; // no sign change--bounce!
    // 				else xvelNow = g_resti*xvelNow;			// sign changed-- don't need another.

    // 			}
    // 			else if (xposNow > 1.8 && xvelNow > 0.0		// collision! right wall...
    // 			) {		// bounce on right wall

    // 				xposNow = 1.8;

    // 				xvelNow = xvelPrev; 
    // 				xvelNow *= g_drag;

    // 				if(xvelNow > 0.0) xvelNow = -g_resti*xvelNow; // no sign change--bounce!
    // 				else xvelNow = g_resti*xvelNow;			// sign changed-- don't need another.

    // 			}
    // 			if(      yposNow < 0.0 && yvelNow < 0.0		// collision! floor...
    // 			) {		// bounce on floor
    // /*
    // 				// Diagnostic printing.  This revealed 'VERY SUBTLE PROBLEM' shown below.
    // 				console.log('y<0 bounce: '+ g_stepCount +'-(BEFORE)------------------');
    // 				console.log(' x,yPos_Prev: (' + //xposPrev.toFixed(3) + 
    // 										'Xpos0, ' + yposPrev.toFixed(3) + ') x,yVel_Prev: (' + 
    // 										//xvelPrev.toFixed(3) + 
    // 										'Xvel0, ' + yvelPrev.toFixed(3) + ');');
    // 										console.log(' x,yPos_Now : (' + 
    // 										//xposNow.toFixed(3) + 
    // 										'Xpos1, ' + yposNow.toFixed(3) + ') x,yVel_Now : (' + 
    // 										// xvelNow.toFixed(3) + 
    // 										'xVel1, ' + yvelNow.toFixed(3) + ');');
    // */
    // 				yposNow = 0.0;					// 1) resolve contact: put particle at wall.
    // 																// 2) remove all y velocity gained from forces as
    // 																// ball moved thru floor in this timestep. HOW?
    // 																// Assume ball reached floor at START of
    // 																// the timestep, thus: return to the orig.
    // 				yvelNow = yvelPrev;			// velocity we had at the start of timestep; 
    // 				yvelNow *= g_drag;			// **BUT** reduced by drag (and any other forces 
    // 																// 	that still apply during this timestep).
    // 																// 3) BOUNCE:  
    // 																//reversed velocity*coeff-of-restitution.
    // 				// ATTENTION! VERY SUBTLE PROBLEM HERE! ------------------------------
    // 				//Balls with tiny, near-zero velocities (e.g. ball nearly at rest on 
    // 				// floor) can easily reverse sign between 'previous' and 'now' 
    // 				// timesteps, even for negligible forces.  Put another way:
    // 				// Step 2), our 'repair' attempt that removes all erroneous x velocity, 
    // 				// has CHANGED the 'now' ball velocity, and MAY have changed its sign as 
    // 				// well,  especially when the ball is nearly at rest. SUBTLE: THUS we 
    // 				// need a velocity-sign test here that ensures the 'bounce' step will 
    // 				// always send the ball outwards, away from its wall or floor collision. 
    // 				if(yvelNow < 0.0) yvelNow = -g_resti*yvelNow; // no sign change--bounce!
    // 				else yvelNow = g_resti*yvelNow;			// sign changed-- don't need another.
    // /*
    // 				// Diagnostic printing.  This revealed 'VERY SUBTLE PROBLEM' shown below.
    // 				console.log('y<0 bounce (AFTER)----');
    // 				console.log(' x,yPos_Prev: (' + //xposPrev.toFixed(3) + 
    // 										'Xpos0, ' + yposPrev.toFixed(3) + ') x,yVel_Prev: (' + 
    // 										//xvelPrev.toFixed(3) + 
    // 										'Xvel0, ' + yvelPrev.toFixed(3) + ');');
    // 										console.log(' x,yPos_Now : (' + 
    // 										//xposNow.toFixed(3) + 
    // 										'Xpos1, ' + yposNow.toFixed(3) + ') x,yVel_Now : (' + 
    // 										// xvelNow.toFixed(3) + 
    // 										'xVel1, ' + yvelNow.toFixed(3) + ');');
    // */			
    // 			}
    // 			else if( yposNow > 1.8 && yvelNow > 0.0 		// collision! ceiling...
    // 			) {		// bounce on ceiling

    // 				yposNow = 1.8;

    // 				yvelNow = yvelPrev;
    // 				yvelNow *= g_drag; 
     
    // 				if(yvelNow > 0.0) yvelNow = -g_resti*yvelNow; // no sign change--bounce!
    // 				else yvelNow = g_resti*yvelNow;			// sign changed-- don't need another.

    // 			}
    // 		}
    // 		else {
    // 			console.log('?!?! unknown constraint: g_bounce==' + g_bounce);
    // 			return;
    // 		}

    // 		displayMe();				// Display particle-system status on-screen.
    // 		//============================================
    // 	}
  }
	
  // ============================= PartSys Update ===================================

  xposNow = partBox.partVec.s1[0];
  yposNow = partBox.partVec.s1[1];
  zposNow = partBox.partVec.s1[2];
  xvelNow = partBox.partVec.s1[3];
  yvelNow = partBox.partVec.s1[4];
  zvelNow = partBox.partVec.s1[5];

  displayMe();        // Display particle-system status on-screen.

  // ==============================================================================


  // ========================= Set Up Perspective Camera =========================
  gl.viewport(0,0,g_canvas.width, g_canvas.height);
  vpMatrix = new Matrix4();
  
  // FOV = 30 deg
  vpMatrix.perspective(30.0,   // FOVY: top-to-bottom vertical image angle, in degrees
                      (g_canvas.width)/g_canvas.height,   // Image Aspect Ratio: camera lens width/height
                      1.0,   // camera z-near distance (always positive; frustum begins at z = -znear)
                      1000.0);  // camera z-far distance (always positive; frustum ends at z = -zfar)
  
  vpMatrix.lookAt(eyeX,  eyeY,  eyeZ,     // center of projection
                 lookAtX, lookAtY, lookAtZ,  // look-at point 
                 0,  0,  1);
 
    
  partBox.switchToMe();
  partBox.adjust(vpMatrix);
  partBox.draw();

  gridBox.switchToMe();
  gridBox.adjust(vpMatrix);
  gridBox.draw();
  
  // Report mouse-drag totals.
	document.getElementById('MouseResult0').innerHTML=
			'Mouse Drag totals (CVV coords):\t'+xMdragTot+', \t'+yMdragTot;	
}


function drawResize() {
//==============================================================================
// Called when user re-sizes their browser window , because our HTML file
// contains:  <body onload="main()" onresize="winResize()">

 // var nuCanvas = document.getElementById('webgl');  // get current canvas
 // var nuGL = getWebGLContext(nuCanvas);             // and context:
  
  // g_canvas.width = window.innerWidth;
  g_canvas.width = document.body.clientWidth;
  g_canvas.height = Math.max(window.innerHeight * 0.6, window.innerHeight);
  // console.log(window.innerWidth, window.innerWidth - 12);
}