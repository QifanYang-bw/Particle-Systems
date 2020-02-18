//=============================================================================
function VboMultiSpring() {

    VboParticleSys.call(this);

    this.nParticles = 32;

    this.partVec = new PartSys();

    this.springForce = new SpringPull(this.partVec);

    this.forceList = [new Gravity(), new Drag(0.95), this.springForce];
    this.limitList = [new AxisWall('x', -6, '+'), new AxisWall('x', 6, '-'),
                      new AxisWall('y', -6, '+'), new AxisWall('y', 6, '-'),
                      new AxisDampenWall('z', 0, '+'), new AxisWall('z', 6, '-')];

    this.partVec.init(this.nParticles, this.forceList, this.limitList);

    var count = 0;
    for (var ii = 0; ii < 4; ii++)
        for (var i = 0; i <= 1; i++) 
            for (var j = 0; j <= 1; j++)
                for (var k = 0; k <= 1; k++) {
                    this.partVec.setPosition(count, (ii & 1) * 2 - 1 + i * .5, (ii & 2) * 2 - 1 + j * .5, .5 + k * .5);
                    count++;
                }

    // for (var i = 0; i <= 1; i++) 
    //     for (var j = 0; j <= 1; j++)
    //         for (var k = 0; k <= 1; k++) {
    //             this.partVec.setPosition(count, 1 + i * .5, -1 + j * .5, .5 + k * .5);
    //             count++;
    //         }


    this.partVec.setRndMasses(1, 1);
    // this.partVec.setMass(0, 1.2);

    this.springForce.setAllForcesInPlace([0, 1, 2, 3, 4, 5, 6, 7], 100); //iArray, k
    this.springForce.setAllForcesInPlace([8, 9, 10, 11, 12, 13, 14, 15], 100); //iArray, k

    this.springForce.setAllForcesInPlace([16, 17, 18, 19, 20, 21, 22, 23], 100); //iArray, k
    this.springForce.setAllForcesInPlace([24, 25, 26, 27, 28, 29, 30, 31], 100); //iArray, k

    this.springForce.setForceWithLength(7, 15, 40, 3); //iArray, k
    this.springForce.setForceWithLength(15, 31, 40, 3); //iArray, k
    this.springForce.setForceWithLength(31, 23, 40, 3); //iArray, k
    this.springForce.setForceWithLength(23, 7, 40, 3); //iArray, k

    // console.log(this.springForce.springList);

}   

VboMultiSpring.prototype = Object.create(VboParticleSys.prototype);
VboMultiSpring.prototype.constructor = VboMultiSpring;