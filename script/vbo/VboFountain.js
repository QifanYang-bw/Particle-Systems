//=============================================================================
function VboFountain() {

    VboParticleSys.call(this);

    this.nParticles = 200;

    this.fountainResp = new FountainRespawn(6, [0, 0, 0.5]);

    this.partVec = new Fountain();
    this.forceList = [new Gravity(), new Drag()];
    this.limitList = [new AxisWall('x', -4, '+'), new AxisWall('x', 4, '-'),
                 new AxisWall('y', -4, '+'), new AxisWall('y', 4, '-'),
                 new AxisWall('z', 0, '+'), new AxisWall('z', 4, '-'),
                 this.fountainResp];


    this.partVec.init(this.nParticles, this.forceList, this.limitList);
    this.partVec.setStatus(this.fountainResp);
    this.partVec.setRndMasses(1, 1);

    // this.partVec.sampleParticleInfo(0);
}

VboFountain.prototype = Object.create(VboParticleSys.prototype);
VboFountain.prototype.constructor = VboFountain;
