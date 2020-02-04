//=============================================================================
function VboMultiSpring() {

    VboParticleSys.call(this);

    this.nParticles = 8;

    this.partVec = new PartSys();

    this.springForce = new SpringPull(this.partVec);

    this.forceList = [new Gravity(), new Drag(0.96), this.springForce];
    this.limitList = [new AxisWall('x', -2, '+'), new AxisWall('x', 2, '-'),
                      new AxisWall('y', -2, '+'), new AxisWall('y', 2, '-'),
                      new AxisWall('z', 0, '+'), new AxisWall('z', 4, '-')];

    this.partVec.init(this.nParticles, this.forceList, this.limitList);
    this.partVec.setPosition(0, 0, 0, .5);
    this.partVec.setPosition(1, 0, .5, .5);
    this.partVec.setPosition(2, .5, 0, .5);
    this.partVec.setPosition(3, .5, .5, .5);
    this.partVec.setPosition(4, 0, 0, 1);
    this.partVec.setPosition(5, 0, .5, 1);
    this.partVec.setPosition(6, .5, 0, 1);
    this.partVec.setPosition(7, .5, .5, 1);

    this.partVec.setRndMasses(1, 1);
    // this.partVec.setMass(0, 1.2);

    this.springForce.setAllForcesInPlace([0, 1, 2, 3, 4, 5, 6, 7], 100); //iArray, k

}   

VboMultiSpring.prototype = Object.create(VboParticleSys.prototype);
VboMultiSpring.prototype.constructor = VboMultiSpring;