//=============================================================================

function VboTornado() {

    VboParticleSys.call(this);

    this.VERT_SRC = 
    'precision mediump float; \n' +        // req'd in OpenGL ES if we use 'float'
    
    'uniform   int u_runMode; \n' +         // particle system state: 
                                            // 0=reset; 1=pause; 2=step; 3=run

    'uniform   mat4 u_MvpMatrix; \n' +
    'attribute vec4 a_Position;\n' +
    'varying   vec4 v_Color; \n' +

    'void main() {\n' +
    '  gl_PointSize = 10.0;\n' +            // TRY MAKING THIS LARGER...
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

    this.nParticles = 2000;

    this.partVec = new PartSys();

    this.forceList = [new TCentripetal(), new RandomBehaviour(1)];

    this.limitList = [new AxisWall('x', -10, '+'), new AxisWall('x', 10, '-'),
                 new AxisWall('y', -10, '+'), new AxisWall('y', 10, '-'),
                 new AxisWall('z', 0, '+'), new AxisWall('z', 6, '-')];


    this.partVec.init(this.nParticles, this.forceList, this.limitList);

    this.partVec.setRndPositions(-4, 4, -4, 4, 0, 6);

    this.partVec.setRndMasses(1, 1);

    // this.partVec.sampleParticleInfo(0);
}

VboTornado.prototype = Object.create(VboParticleSys.prototype);
VboTornado.prototype.constructor = VboTornado;
