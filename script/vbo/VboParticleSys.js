// Define all the adjustable ball-movement parameters, and
var INIT_VEL =  0.15 * 60.0;    // initial velocity in meters/sec.
                        // adjust by ++Start, --Start buttons. Original value 
                        // was 0.15 meters per timestep; multiply by 60 to get
                        // meters per second.
                        // timesteps per second.
var g_drag = 0.985;     // units-free air-drag (scales velocity); adjust by d/D keys
var g_grav = 9.832;     // gravity's acceleration; adjust by g/G keys
                        // on Earth surface: 9.832 meters/sec^2.
var g_resti = 1.0;      // units-free 'Coefficient of restitution' for 
                        // inelastic collisions.  Sets the fraction of momentum 
                        // (0.0 <= g_resti < 1.0) that remains after a ball 
                        // 'bounces' on a wall or floor, as computed using 
                        // velocity perpendicular to the surface. 
                        // (Recall: momentum==mass*velocity.  If ball mass does 
                        // not change, and the ball bounces off the x==0 wall,
                        // its x velocity xvel will change to -xvel*g_resti ).
var g_solver = 1;       // adjust by s/S keys.
                        // ==0 for Euler solver (explicit, forward-time, as 
                        // found in BouncyBall03 and BouncyBall04.goodMKS)
                        // ==1 for special-case implicit solver, reverse-time, 
                        // as found in BouncyBall03.01BAD, BouncyBall04.01badMKS)
var g_bounce = 1;       // floor-bounce constraint type:
                        // ==0 for velocity-reversal, as in all previous versions
                        // ==1 for Chapter 3's collision resolution method, which
                        // uses an 'impulse' to cancel any velocity boost caused
                        // by falling below the floor.

//=============================================================================
function VboParticleSys() {
  //
  //=============================================================================
  // CONSTRUCTOR for one re-usable 'VboParticleSys' object that holds all data and fcns
  // needed to render vertices from one Vertex Buffer Object (VBO) using one 
  // separate shader program (a vertex-shader & fragment-shader pair) and one
  // set of 'uniform' variables.

  // Constructor goal: 
  // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
  // written into code) in all other VBObox functions. Keeping all these (initial)
  // values here, in this one coonstrutor function, ensures we can change them 
  // easily WITHOUT disrupting any other code, ever!
    

  	this.VERT_SRC =	
    'precision mediump float;\n' +        // req'd in OpenGL ES if we use 'float'
    
    'uniform   int u_runMode; \n' +         // particle system state: 
                                            // 0=reset; 1=pause; 2=step; 3=run

    'uniform   mat4 u_MvpMatrix; \n' +
    'attribute vec4 a_Position;\n' +
    'varying   vec4 v_Color; \n' +

    'void main() {\n' +
    '  gl_PointSize = 20.0;\n' +            // TRY MAKING THIS LARGER...
    '  gl_Position = u_MvpMatrix * a_Position; \n' +  

    '  if(u_runMode == 0) { \n' +    // Let u_runMode determine particle color:
    '    v_Color = vec4(1.0, 0.0, 0.0, 1.0);  \n' +   // red: 0==reset
    '  } \n' +
    '  else if(u_runMode == 1) {  \n' +
    '    v_Color = vec4(1.0, 1.0, 0.0, 1.0); \n' +  // yellow: 1==pause
    '  }  \n' +
    '  else if(u_runMode == 2) { \n' +    
    '    v_Color = vec4(1.0, 1.0, 1.0, 1.0); \n' +  // white: 2==step
    '  } \n' +
    '  else { \n' +
    '    v_Color = vec4(0.2, 1.0, 0.2, 1.0); \n' +  // green: >3==run
    '  } \n' +
    '} \n';

  	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
    'precision mediump float;\n' +
    'varying vec4 v_Color; \n' +
    'void main() {\n' +
    '  float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); \n' +
    '  if(dist < 0.5) { \n' + 
    '    gl_FragColor = vec4((1.0-2.0*dist)*v_Color.rgb, 1.0); \n' +
    '  } else { \n' +
    '    discard; ' + 
    '  }\n' +
    '}\n';

    this.nParticles;

    this.partVec;
    this.forceList;
    this.limitList;

  //=============================================================================

  	            //-----------------------GPU memory locations:
  	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
  	                              // returned by gl.createBuffer() function call
  	this.shaderLoc;								// GPU Location for compiled Shader-program  
  	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
  								          //------Attribute locations in our shaders:
  	// this.a_PosLoc;								// GPU location for 'a_Pos0' attribute
  	// this.a_ColrLoc;								// GPU location for 'a_Colr0' attribute

  	            //---------------------- Uniform locations &values in our shaders
  	this.ModelMat = new Matrix4();	// Transforms CVV axes to model axes.

    this.a_PositionID;
    this.u_runModeID;
    this.u_MvpMatrixID;

    this.FSIZE;
}

VboParticleSys.prototype.init = function() {

  // a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU.');
    return;
  }

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

  this.FSIZE = this.partVec.s1.BYTES_PER_ELEMENT;  // 'float' size, in bytes.


//==============================================================================
// Set up all buffer objects on our graphics hardware.

  // Create a buffer object in the graphics hardware: get its ID# 
  this.vboLoc = gl.createBuffer();
  if (!this.vboLoc) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  // "Bind the new buffer object (memory in the graphics system) to target"
  // In other words, specify the usage of one selected buffer object.
  // What's a "Target"? it's the poorly-chosen OpenGL/WebGL name for the 
  // intended use of this buffer's memory; so far, we have just two choices:
  //  == "gl.ARRAY_BUFFER" meaning the buffer object holds actual values we need 
  //      for rendering (positions, colors, normals, etc), or 
  //  == "gl.ELEMENT_ARRAY_BUFFER" meaning the buffer object holds indices 
  //      into a list of values we need; indices such as object #s, face #s, 
  //      edge vertex #s.

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

 // // Write data from our JavaScript array to graphics systems' buffer object:
  gl.bufferData(gl.ARRAY_BUFFER, this.partVec.s1, gl.DYNAMIC_DRAW);

  // Get the ID# for the a_Position variable in the graphics hardware
  this.a_PositionID = gl.getAttribLocation(gl.program, 'a_Position');
  if(this.a_PositionID < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  gl.vertexAttribPointer(this.a_PositionID, 
          this.partVec.PartPosDim,  // # of values in this attrib (1,2,3,4) 
          gl.FLOAT, // data type (usually gl.FLOAT)
          false,    // use integer normalizing? (usually false)
          this.partVec.PartObjectSize * this.FSIZE,  // Stride: #bytes from 1st stored value to next one
          this.partVec.PartPosLoc * this.FSIZE); // Offset; #bytes from start of buffer to 
                    // 1st stored attrib value we will actually use.

  // Enable this assignment of the bound buffer to the a_Position variable:
  gl.enableVertexAttribArray(this.a_PositionID);
  
  // Get graphics system storage location of uniforms our shaders use:
  // (why? see  http://www.opengl.org/wiki/Uniform_(GLSL) )
  this.u_runModeID = gl.getUniformLocation(gl.program, 'u_runMode');
  if(!this.u_runModeID) {
    console.log('Failed to get u_runMode variable location');
    return;
  }

  this.u_MvpMatrixID = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if(!this.u_MvpMatrixID) {
    console.log('Failed to get u_MvpMatrixID variable location');
    return;
  }

}

VboParticleSys.prototype.switchToMe = function() {
  //==============================================================================
  // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)

  // a) select our shader program:
  gl.useProgram(this.shaderLoc);	

 //  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
 //  //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
 //  //    supply values to use as attributes in our newly-selected shader program:

  // gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

 // // Write data from our JavaScript array to graphics systems' buffer object:
  // gl.bufferData(gl.ARRAY_BUFFER, this.partVec.s1, gl.STATIC_DRAW);

  //  // c) connect our newly-bound VBO to supply attribute variable values for each
  //  // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
  //  // this sets up data paths from VBO to our shader units:
  //    // 	Here's how to use the almost-identical OpenGL version of this function:
  //  	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )

}

VboParticleSys.prototype.isReady = function() {
  //==============================================================================
  // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
  // this objects VBO and shader program; else return false.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

  var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VboParticleSys.prototype.adjust = function(vpMatrix) {
  //==============================================================================
  // Update the GPU to newer, current values we now store for 'uniform' vars on 
  // the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }  

  if(   g_myRunMode > 1) {                // 0=reset; 1= pause; 2=step; 3=run
    if (g_myRunMode == 2) g_myRunMode = 1;     // (if 2, do just one step and pause.)

    this.partVec.renderFrame();

  }

  gl.bufferSubData( 
    gl.ARRAY_BUFFER,  // specify the 'binding target': either
            //    gl.ARRAY_BUFFER (VBO holding sets of vertex attribs)
            // or gl.ELEMENT_ARRAY_BUFFER (VBO holding vertex-index values)
    0,      // offset: # of bytes to skip at the start of the VBO before 
              // we begin data replacement.
    this.partVec.s1 // Float32Array data source.
  );

  // this.ModelMat = new Matrix4(vpMatrix);
  
  // this.ModelMat.translate( 0, -0, 0.0);  
  // this.ModelMat.scale(0.1, 0.1, 0.1);       // shrink by 10X:
  // //  Transfer new uniforms' values to the GPU:-------------
  // // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  // gl.uniformMatrix4fv(this.u_ModelMatLoc,	// GPU location of the uniform
  // 										false, 				// use matrix transpose instead?
  // 										this.ModelMat.elements);	// send data from Javascript.

  // console.log(vpMatrix);

  gl.uniformMatrix4fv(this.u_MvpMatrixID, false, vpMatrix.elements);

  gl.uniform1i(this.u_runModeID, g_myRunMode); // run/step/pause the particle system

  // Maybe I should assign the values here?
  // gl.uniform4f(this.u_ballShiftID, xposNow, yposNow, zposNow, 0.0);  // send to gfx system
}

VboParticleSys.prototype.draw = function(partVec) {
//=============================================================================
// Render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }  

  // Draw our VBO's contents:

  // console.log(this.partVec.s1);
  // Draw our VBO's new contents:
  gl.drawArrays(gl.POINTS,          // mode: WebGL drawing primitive to use 
                0,                  // index: start at this vertex in the VBO;
                this.partVec.partCount);    // draw this many vertices.



  // var j = 0;
  
  // for (var i = 0; i < this.partVec.partCount; i++, j+=this.partVec.PartObjectSize) {

  //   var loc = this.partVec.PartPosLoc + j;

  //   gl.uniform4f(this.u_ballShiftID,
  //                this.partVec.s1[loc + 0],
  //                this.partVec.s1[loc + 1],
  //                this.partVec.s1[loc + 2],
  //                0.0
  //               ); 

  //   gl.drawArrays(gl.POINTS, 0, 1);

  // }




  // This wouldn't hold for long, but it works for now

   // send to gfx system

  // gl.uniform4f(this.u_ballShiftID, xposNow, yposNow, zposNow, 0.0);  // send to gfx system
}

VboParticleSys.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU inside our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 // gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
 //                  0,                  // byte offset to where data replacement
 //                                      // begins in the VBO.
 // 					 				this.vboContents);   // the JS source-data array used to fill VBO

}
/*
VboParticleSys.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VboParticleSys.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/