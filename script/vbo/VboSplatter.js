//=============================================================================
function VboSplatter() {

    VboParticleSys.call(this);

    this.nParticles = 200;

    this.partVec = new PartSys();
    this.forceList = [new Gravity(), new Drag()];
    this.limitList = [new AxisWall('x', -2, '+'), new AxisWall('x', 2, '-'),
                 new AxisWall('y', -2, '+'), new AxisWall('y', 2, '-'),
                 new AxisWall('z', 0, '+'), new AxisWall('z', 4, '-')];


    this.partVec.init(this.nParticles, this.forceList, this.limitList);
    this.partVec.setRndPositions(-1.8, 1.8, -1.8, 1.8, 0.2, 3.8);
    this.partVec.setRndMasses(1, 1);

}

VboSplatter.prototype = Object.create(VboParticleSys.prototype);
VboSplatter.prototype.constructor = VboSplatter;