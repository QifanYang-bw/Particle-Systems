//=============================================================================
function VboSingleSpring() {

    VboParticleSys.call(this);

    this.nParticles = 2;

    this.partVec = new PartSys();

    this.springForce = new SpringPull(this.partVec);

    this.forceList = [new Gravity(), new Drag(), this.springForce];
    this.limitList = [new AxisWall('x', -2, '+'), new AxisWall('x', 2, '-'),
                      new AxisWall('y', -2, '+'), new AxisWall('y', 2, '-'),
                      new AxisWall('z', 0, '+'), new AxisWall('z', 4, '-')];

    this.partVec.init(this.nParticles, this.forceList, this.limitList);
    this.partVec.setPosition(0, 0, 0, 0.2);
    this.partVec.setPosition(1, 1, -1, 0.2); //l = sqrt(2)
    this.partVec.setMass(0, 2);
    this.partVec.setMass(1, 1);

    this.springForce.setForceWithLength(i1 = 0, i2 = 1, k = 20, l = 1); //i1, i2, k, l

}   

VboSingleSpring.prototype = Object.create(VboParticleSys.prototype);
VboSingleSpring.prototype.constructor = VboSingleSpring;