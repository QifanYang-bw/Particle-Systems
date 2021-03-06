var SpringPullPair = function(i1, i2, k, l) {

    if (Math.abs(i1 - Math.trunc(i1)) > 1e-6) {
        throw new Error('SpringPullPair: Parameter i1 is not an integer!');
    }
    if (Math.abs(i2 - Math.trunc(i2)) > 1e-6) {
        throw new Error('SpringPullPair: Parameter i2 is not an integer!');
    }

    this.i1 = i1;
    this.i2 = i2;
    this.k = k;
    this.l = l;

}

// ==================== SpringPull CForcer ====================
var SpringPull = function(partSys) { 

    CForcer.call(this);

    this.p = partSys;

    // SpringPull parameters
    this.springList = [];

}
SpringPull.prototype = Object.create(CForcer.prototype);
SpringPull.prototype.constructor = SpringPull;

SpringPull.prototype.setForceInPlace = function(i1, i2, k) {
    this.springList.push(new SpringPullPair(i1, i2, k, this._distonIndex(i1, i2)));
}

SpringPull.prototype.setChainForcesInPlace = function(iArray, k) {
    var n = iArray.length;
    for (var i1 = 0; i1 < n - 1; i1++) {
        this.setForceInPlace(iArray[i1], iArray[i1 + 1], k);
    }
}

SpringPull.prototype.setAllForcesInPlace = function(iArray, k) {
    var n = iArray.length;

    for (var i1 = 0; i1 < n; i1++) {
        for (var i2 = i1 + 1; i2 < n; i2++) {
            this.setForceInPlace(iArray[i1], iArray[i2], k);
        }
    }
}

SpringPull.prototype.setForceWithLength = function(i1, i2, k, l) {
    this.springList.push(new SpringPullPair(i1, i2, k, l));
}

SpringPull.prototype.setChainForcesWithLength = function(iArray, k, l) {
    var n = iArray.length;

    for (var i1 = 0; i1 < n - 1; i1++) {
        this.setForceWithLength(iArray[i1], iArray[i1 + 1], k, l);
    }
}

SpringPull.prototype.setAllForcesWithLength = function(iArray, k, l) {
    var n = iArray.length;

    for (var i1 = 0; i1 < n; i1++) {
        for (var i2 = i1 + 1; i2 < n; i2++) {
            this.setForceWithLength(iArray[i1], iArray[i2], k, l);
        }
    }
}


SpringPull.prototype.__applyForce = function() {

    var dirc, dist, force, ratio, inc1, tinc2;

    for (var x = 0; x < this.springList.length; x++) {

        dirc = this._veconIndex(this.springList[x].i1, this.springList[x].i2);
        dist = this._distonVec(dirc);

        force = this.springList[x].k * (dist - this.springList[x].l);

        // console.log(force);

        // Avoiding DivisionByZero Error
        ratio = force / (dist + 1e-6);

        tinc1 = this.p.PartObjectSize * this.springList[x].i1 + this.p.PartFLoc;
        tinc2 = this.p.PartObjectSize * this.springList[x].i2 + this.p.PartFLoc;

        // Applying Force
        for (var inc = 0; inc < this.p.PartDim; inc++) {
            this.p.s1[inc + tinc1] -= dirc[inc] * ratio;
            this.p.s1[inc + tinc2] += dirc[inc] * ratio;
        }

    }

}