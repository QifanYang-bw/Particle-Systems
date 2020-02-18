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

var gridBox, partBoxArray;
var defaultVec;
var solverFunc;

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

  // ============================= GUI Init ===================================
  
  initGUI();

  // ============================= VboBox Init ===================================

  initBoxes();

  // ============================= Canvas Settings ===================================
	
  gl.clearColor(0.1, 0.1, 0.09, 1);    // RGBA color for clearing WebGL framebuffer
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
 
  renderBoxes(vpMatrix);
  
  // ============================= Display Update ===================================

  xposNow = defaultVec.s1[0];
  yposNow = defaultVec.s1[1];
  zposNow = defaultVec.s1[2];
  xvelNow = defaultVec.s1[3];
  yvelNow = defaultVec.s1[4];
  zvelNow = defaultVec.s1[5];

  displayMe();        // Display particle-system status on-screen.
  
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