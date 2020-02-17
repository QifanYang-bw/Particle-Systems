//=============================================================================
function VboMultiSpring() {

    VboParticleSys.call(this);

    this.nParticles = 16;

    this.partVec = new PartSys();

    this.springForce = new SpringPull(this.partVec);

    this.forceList = [new Gravity(), new Drag(0.95), this.springForce];
    this.limitList = [new AxisWall('x', -2, '+'), new AxisWall('x', 2, '-'),
                      new AxisWall('y', -2, '+'), new AxisWall('y', 2, '-'),
                      new AxisDampenWall('z', 0, '+'), new AxisWall('z', 4, '-')];

    this.partVec.init(this.nParticles, this.forceList, this.limitList);

    var count = 0;
    for (var i = 0; i <= 1; i++) 
        for (var j = 0; j <= 1; j++)
            for (var k = 0; k <= 1; k++) {
                this.partVec.setPosition(count, -1 + i * .5, 1 + j * .5, .5 + k * .5);
                count++;
            }

    for (var i = 0; i <= 1; i++) 
        for (var j = 0; j <= 1; j++)
            for (var k = 0; k <= 1; k++) {
                this.partVec.setPosition(count, 1 + i * .5, -1 + j * .5, .5 + k * .5);
                count++;
            }


    this.partVec.setRndMasses(1, 1);
    // this.partVec.setMass(0, 1.2);

    this.springForce.setAllForcesInPlace([0, 1, 2, 3, 4, 5, 6, 7], 100); //iArray, k
    this.springForce.setAllForcesInPlace([8, 9, 10, 11, 12, 13, 14, 15], 100); //iArray, k

    this.springForce.setForceWithLength(7, 8, 80, .6); //iArray, k

    // console.log(this.springForce.springList);

}   

VboMultiSpring.prototype = Object.create(VboParticleSys.prototype);
VboMultiSpring.prototype.constructor = VboMultiSpring;