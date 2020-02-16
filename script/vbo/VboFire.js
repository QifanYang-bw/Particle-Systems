//=============================================================================
function VboFire() {

    VboParticleSys.call(this);

    // Set Part
    this.partVec = new Fire();

    // Rewrite shaders
    // if (false)
    {
        this.VERT_SRC = 
        'precision mediump float;\n' +        // req'd in OpenGL ES if we use 'float'
        
        'uniform   int u_runMode; \n' +         // particle system state: 
                                                // 0=reset; 1=pause; 2=step; 3=run

        'uniform   mat4 u_MvpMatrix; \n' +
        'attribute vec4 a_Position; \n' +
        'attribute vec4 a_Age; \n' +
        'attribute vec4 a_Color; \n' +

        'varying   vec4 v_Color; \n' +

        'void main() {\n' +
        '  gl_PointSize = 6.0;\n' +
        '  gl_Position = u_MvpMatrix * a_Position; \n' +  

        '  if(u_runMode == 0) { \n' +    // Let u_runMode determine particle color:
        '    v_Color = vec4(1.0, 1.0, 1.0, 1.0);  \n' +   // red: 0==reset
        '  } \n' +
        '  else if(u_runMode == 1) {  \n' +
        '    v_Color = vec4(1.0, 1.0, 0.0, 1.0); \n' +  // yellow: 1==pause
        '  }  \n' +
        '  else { \n' +
        '    v_Color = a_Color;  \n' +
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
    }

    // Add extra attribute pointers
    this.a_AgeID;
    this.a_ColorID;

    this.nParticles = 1500;

    this.fireResp = new FireRespawn(4, [0, 0, 0.5]);

    this.forceList = [new Gravity(.3), new Drag()];
    this.limitList = [new AxisWall('x', -4, '+'), new AxisWall('x', 4, '-'),
                 new AxisWall('y', -4, '+'), new AxisWall('y', 4, '-'),
                 new AxisWall('z', 0, '+'), new AxisWall('z', 4, '-'),
                 this.fireResp];


    this.partVec.init(this.nParticles, this.forceList, this.limitList);
    this.partVec.setStatus(this.fireResp);
    this.partVec.setRndMasses(1, 1);


}

VboFire.prototype = Object.create(VboParticleSys.prototype);
VboFire.prototype.constructor = VboFire;

VboFire.prototype.init = function() {

    VboParticleSys.prototype.init.apply(this, arguments);

    this.a_AgeID = gl.getAttribLocation(gl.program, 'a_Age');
    if(this.a_a_AgeID < 0) {
        console.log('Failed to get the storage location of a_Age');
        return -1;
    }
    
    this.a_ColorID = gl.getAttribLocation(gl.program, 'a_Color');
    if(this.a_ColorID < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }

}

VboFire.prototype.switchToMe = function() {

    VboParticleSys.prototype.switchToMe.apply(this, arguments);

    // Load Age
    gl.vertexAttribPointer(this.a_AgeID, 
        1,  // # of values in this attrib (1,2,3,4) 
        gl.FLOAT, // data type (usually gl.FLOAT)
        false,    // use integer normalizing? (usually false)
        this.partVec.PartObjectSize * this.FSIZE,  // Stride: #bytes from 1st stored value to next one
        this.partVec.PartAgeSingle * this.FSIZE); // Offset; #bytes from start of buffer to 
                    // 1st stored attrib value we will actually use.

    // Enable this assignment of the bound buffer to the a_Position variable:
    gl.enableVertexAttribArray(this.a_AgeID);

    // Load Color
    gl.vertexAttribPointer(this.a_ColorID, 
        this.partVec.PartColorDim,  // # of values in this attrib (1,2,3,4) 
        gl.FLOAT, // data type (usually gl.FLOAT)
        false,    // use integer normalizing? (usually false)
        this.partVec.PartObjectSize * this.FSIZE,  // Stride: #bytes from 1st stored value to next one
        this.partVec.PartColorLoc * this.FSIZE); // Offset; #bytes from start of buffer to 
                    // 1st stored attrib value we will actually use.

    // Enable this assignment of the bound buffer to the a_Position variable:
    gl.enableVertexAttribArray(this.a_ColorID);

}