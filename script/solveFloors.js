//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// ORIGINAL SOURCE:
// RotatingTranslatedTriangle.js (c) 2012 matsuda
// HIGHLY MODIFIED to make:
//
// BouncyBall.js  for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin
//  BouncyBall01:---------------
//		--converted to 2D->4D; 
//		--3  verts changed to 'vCount' particles in one Vertex Buffer Object 
//			(VBO) in initVertexBuffers() function
//		--Fragment shader draw POINTS primitives as round and 'soft'
//			by using the built-in variable 'gl_PointCoord' that exists ONLY for
//			drawing WebGL's 'gl.POINTS' primitives, and no others.
//
// BouncyBall02:----------------
//		--modified animation: removed rotation, added better animation comments, 
//				replaced 'currentAngle' with 'g_timeStep'.
//		--added keyboard & mouse controls:from EECS 351-1 Winter starter-code
 //				'5.04jt.ControlMulti.html'  (copied code almost verbatim)
//				(for now, 1,2,3 keys just controls the color of our 3 particles) 
//		--Added 'u_runMode' uniform to control particle-system animation.
//
//	BouncyBall03:---------------
//		--Eliminated 'obsolete' junk commented out in BouncyBall02
//		--initVertexBuffer() reduced to just one round particle; 
//		--added 'uniform' vec4 'u_ballOffset' for that particle's position
//		--in draw(), computed that offset as described in class in Week 1.
//		--implement user controls: 
//				--r or R key to ''refresh' or 'Reset' the bouncy ball;
//				--p or P key to pause/unpause the bouncy ball;
//				--SPACE BAR to single-step the bouncy ball.
//
//		04.goodMKS:-------------------
//		--Convert bouncyBall03.js to MKS units (meters-kilograms-seconds): 
//			On-screen position within the CVV (+/-1) now measured in meters; 
//			particle mass now measured in Kg; g_timestep measured in seconds;
//		--add on-screen displayMe() to show current parameters, incl. ball velocity
//		--add 'c' or 'C' key to toggle WebGL screen-clearing in draw() fcn. 
//				(NOTE: modifies creation of drawing-context 'gl' in main() too!)
//		--add 'D/d' key to adjust drag up or down;
//		--add 'G/g' key to adjust gravity up or down.
//			See textbook: resolving collisions, & resting contacts;
//			See BouncyBall05.solveFloors to see it implemented in 2D.
//
//		04.01badMKS:---------------------
//		-- Convert bouncyBall03.01BAD.js to MKS units, as we did for 04.goodMKS
//		'draw()' function in what SEEMS like the more sensible way -- and it fails,
//		just as before, but now in MKS units (ball keeps bouncing forever!).
//
//		05.SolveFloors:------------------
//		--add s/S key to toggle explicit/implicit solvers ('bad'/'good')
//		--add b/B key to toggle between old/new way to bounce on floors/walls
//		--add 'stepCount' to give each g_timestep a unique label for debugging;
//		--add 'printBall()' to print current and previous ball pos & velocity.
//				This is especially useful for debugging constraints & resting contact.
//
//    06.SolveFloors:-------------------
//    --clearly label all global vars with 'g_' prefix: g_timeStep, etc.
//    --improve r/R keys for more intuitive usage; better on-screen user guide

//		NEXT TASKS:
//		--Add 3D perspective camera; add user-controls to position & aim camera
//		--Add ground-plane (xy==ground; +z==up)
//		--extend particle system to 'bounce around' in a 3D box in world coords
//		--THE BIG TASK for Week 2: 'state-variable' formulation!
//			explore, experiment: how can we construct a 'state variable' that we
//			store and calculate and update on the graphics hardware?  How can we 
//			avoid transferring state vars from JavaScript to the graphics system
//			on each and every g_timestep?
//			-True, vertex shaders CAN'T modify attributes or uniforms (input only),
//			-But we CAN make a global array of floats, of structs ...
//				how could you use them?
//				can you use Vertex Buffer objects to initialize those arrays, then
//				use those arrays as your state variables?
//				HINT: create an attribute that holds an integer 'particle number';
//				use that as your array index for that particle... 
//
//==============================================================================
// Vertex shader program:
// var VSHADER_SOURCE =
//   'precision mediump float;\n' +				// req'd in OpenGL ES if we use 'float'
  
//   'uniform   int u_runMode; \n' +					// particle system state: 
//   																				// 0=reset; 1= pause; 2=step; 3=run
//   'uniform	 vec4 u_ballShift; \n' +			// single bouncy-ball's movement

//   'uniform   mat4 u_MvpMatrix; \n' +
//   'attribute vec4 a_Position;\n' +

//   'varying   vec4 v_Color; \n' +
//   'void main() {\n' +
//   '  gl_PointSize = 20.0;\n' +            // TRY MAKING THIS LARGER...
//   '	 gl_Position = u_MvpMatrix * (a_Position + u_ballShift); \n' +	

// 	// Let u_runMode determine particle color:
//   '  if(u_runMode == 0) { \n' +
// 	'	   v_Color = vec4(1.0, 0.0, 0.0, 1.0);	\n' +		// red: 0==reset
// 	'  	 } \n' +
// 	'  else if(u_runMode == 1) {  \n' +
// 	'    v_Color = vec4(1.0, 1.0, 0.0, 1.0); \n' +	// yellow: 1==pause
// 	'    }  \n' +
// 	'  else if(u_runMode == 2) { \n' +    
// 	'    v_Color = vec4(1.0, 1.0, 1.0, 1.0); \n' +	// white: 2==step
//   '    } \n' +
// 	'  else { \n' +
// 	'    v_Color = vec4(0.2, 1.0, 0.2, 1.0); \n' +	// green: >3==run
// 	'		 } \n' +
//   '} \n';
// Each instance computes all the on-screen attributes for just one VERTEX,
// supplied by 'attribute vec4' variable a_Position, filled from the 
// Vertex Buffer Object (VBO) we created inside the graphics hardware by calling 
// the 'initVertexBuffers()' function. 

//==============================================================================
// Fragment shader program:
// var FSHADER_SOURCE =
//   'precision mediump float;\n' +
//   'varying vec4 v_Color; \n' +
//   'void main() {\n' +
//   '  float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); \n' +
//   '  if(dist < 0.5) { \n' +	
// 	'  	 gl_FragColor = vec4((1.0-2.0*dist)*v_Color.rgb, 1.0); \n' +
// 	'  } else { \n' +
//   '    discard; ' + 
//   '  }\n' +
//   '}\n';
// --Each instance computes all the on-screen attributes for just one PIXEL.
// --Draw large POINTS primitives as ROUND instead of square.  HOW?
//   See pg. 377 in  textbook: "WebGL Programming Guide".  The vertex shaders' 
// gl_PointSize value sets POINTS primitives' on-screen width and height, and
// by default draws POINTS as a square on-screen.  In the fragment shader, the 
// built-in input variable 'gl_PointCoord' gives the fragment's location within
// that 2D on-screen square; value (0,0) at squares' lower-left corner, (1,1) at
// upper right, and (0.5,0.5) at the center.  The built-in 'distance()' function
// lets us discard any fragment outside the 0.5 radius of POINTS made circular.
// (CHALLENGE: make a 'soft' point: color falls to zero as radius grows to 0.5)?
// -- NOTE! gl_PointCoord is UNDEFINED for all drawing primitives except POINTS;
// thus our 'draw()' function can't draw a LINE_LOOP primitive unless we turn off
// our round-point rendering.  
// -- All built-in variables: http://www.opengl.org/wiki/Built-in_Variable_(GLSL)

// Global Variables
// =========================
// Use globals to avoid needlessly complex & tiresome function argument lists.
// For example, the WebGL rendering context 'gl' gets used in almost every fcn;
// requiring 'gl' as an argument won't give us any added 'encapsulation'; make
// it global.  Later, if the # of global vars grows, we can unify them in to 
// one (or just a few) sensible global objects for better modularity.

var gl;   // webGL Rendering Context.  Created in main(), used everywhere.
var g_canvas; // our HTML-5 canvas object that uses 'gl' for drawing.

var g_timeStep = 1000.0/60.0;			// current timestep (1/60th sec) in milliseconds
var g_timeStepMin = g_timeStep;   // min,max timestep values since last keypress.
var g_timeStepMax = g_timeStep;   // (initialized here)

var g_last = Date.now();				//  Timestamp: set after each frame of animation,
																// used by 'animate()' function to find how much
																// time passed since we last updated our canvas.
var g_stepCount = 0;						// Advances by 1 for each timestep, modulo 1000, 
																// (0,1,2,3,...997,998,999,0,1,2,..) to identify 
																// WHEN the ball bounces.  RESET by 'r' or 'R'.

//=============================================================================

// For keyboard, mouse-click-and-drag:		
var g_myRunMode = 3;	// particle system state: 0=reset; 1= pause; 2=step; 3=run

var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;   
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;  

var isClear = 1;		// 0 or 1 to enable or disable screen-clearing in the
//									// draw() function. 'C' or 'c' key toggles in myKeyPress().

var partVec = new PartSys();
var forceList = [new Gravity(), new Drag()];
var limitList = [new AxisWall('x', -2, '+'), new AxisWall('x', 2, '-'),
                 new AxisWall('y', -2, '+'), new AxisWall('y', 2, '-'),
                 new AxisWall('z', 0, '+'), new AxisWall('z', 2, '-')];

//============================== WebGL Global Variables ===============================

// Temperal Solution; Need changing
var xposNow, yposNow, zposNow;

var vpMatrix;

var a_PositionID, u_runModeID, u_ballShiftID, u_MvpMatrixID;

var partBox, gridBox;

var nParticles = 100;

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
	
  gridBox = new VboGrid();
  partBox = new VboParticles();

  gridBox.init();
  partBox.init();

  // ============================= PartSys Init ===================================

  partVec.init(nParticles, forceList, limitList);

  partVec.setRndPositions(-1.8, 1.8, -1.8, 1.8, 0.2, 3.8);
  partVec.setRndMasses(1, 1);

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

  // console.log(partVec.s1);

  if(   g_myRunMode > 1) {                // 0=reset; 1= pause; 2=step; 3=run

    if (g_myRunMode == 2) g_myRunMode = 1;     // (if 2, do just one step and pause.)

    partVec.applyForces();
    partVec.dotFinder();
    partVec.solver();
    partVec.doConstraint();
    partVec.render();
    partVec.swap();

  }
    

  xposNow = partVec.s1[0];
  yposNow = partVec.s1[1];
  zposNow = partVec.s1[2];
  xvelNow = partVec.s1[3];
  yvelNow = partVec.s1[4];
  zvelNow = partVec.s1[5];

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
  partBox.draw(partVec);

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
  g_canvas.height = Math.max(window.innerHeight * 0.6, window.innerHeight - 300);
  // console.log(window.innerWidth, window.innerWidth - 12);
}