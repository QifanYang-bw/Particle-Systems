//=============================================================================
function VboBoid() {

    VboParticleSys.call(this);

    this.nParticles = 200;

    this.partVec = new PartSys();

    this.forceList = [new BoidBehaviour(), new RandomBehaviour(), new Drag(0.99)];
    // this.forceList = [new BoidBehaviour(), new RandomBehaviour()];

    this.limitList = [new AxisWall('x', -4, '+'), new AxisWall('x', 4, '-'),
                 new AxisWall('y', -4, '+'), new AxisWall('y', 4, '-'),
                 new AxisWall('z', 0, '+'), new AxisWall('z', 8, '-')];


    this.partVec.init(this.nParticles, this.forceList, this.limitList);

    this.partVec.setRndPositions(-2, 2, -2, 2, 0, 8);

    this.partVec.setRndMasses(1, 1);

    // this.partVec.sampleParticleInfo(0);
}

VboBoid.prototype = Object.create(VboParticleSys.prototype);
VboBoid.prototype.constructor = VboBoid;
