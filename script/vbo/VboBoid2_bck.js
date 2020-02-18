//=============================================================================

function VboBoid2() {

    VboParticleSys.call(this);

    this.nParticles = 200;

    this.partVec = new Boid2();

    this.forceList = [new BoidBehaviour(effectDist = 0.2, coeff = 1)]; //, new RandomBehaviour(.2)];

    this.sizeFactor = 2;

    this.limitList = [new AxisWall('x', -this.sizeFactor, '+'), new AxisWall('x', this.sizeFactor, '-'),
                 new AxisWall('y', -this.sizeFactor, '+'), new AxisWall('y', this.sizeFactor, '-'),
                 new AxisWall('z', 0, '+'), new AxisWall('z', this.sizeFactor * 2, '-')];
    this.partVec.init(this.nParticles, this.forceList, this.limitList);

    this.partVec.setRndPositions(-this.sizeFactor, this.sizeFactor, -this.sizeFactor, this.sizeFactor, 0, this.sizeFactor * 2);

    this.partVec.setRndMasses(1, 1);

    // this.partVec.sampleParticleInfo(0);
}

VboBoid2.prototype = Object.create(VboParticleSys.prototype);
VboBoid2.prototype.constructor = VboBoid;
