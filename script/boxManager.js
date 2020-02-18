var solverFunc;

function initBoxes() {

  gridBox = new VboGrid();

  partBoxArray = [new VboTornado(),
                  new VboBoid(),
                  new VboFire(),
                  new VboMultiSpring()];

  // partBoxArray = [new VboFire(), null];

  gridBox.init();

  for (var i = 0; i < partBoxArray.length; i++) {
    if (partBoxArray[i] != null) partBoxArray[i].init();
  }

  defaultVec = partBoxArray[0].partVec;

  globalLimitList = [new SphereObject(), new CylinderObject()];

  globalForceList = [new SphereField()];

}

function renderBoxes(vpMatrix) {

  setGlobalSolver();
  setGlobalForces();
  setGlobalLimits();

  if (settings.ForceField) {
    drawBox(0, vpMatrix);
  }
  if (settings.Boid) {
    drawBox(1, vpMatrix);
  }
  if (settings.Flame) {
    drawBox(2, vpMatrix);
  }
  if (settings.Springs) {
    drawBox(3, vpMatrix);
  }

  gridBox.switchToMe();
  gridBox.adjust(vpMatrix);
  gridBox.draw();

}

function setGlobalLimits() {
  globalLimitList[0].enabled = settings.sphereEnabled;
  globalLimitList[1].enabled = settings.cylinderEnabled;
}

function setGlobalForces() {
  globalForceList[0].enabled = settings.sphForceEnabled;
}

function drawBox(id, vpMatrix) {
    partBoxArray[id].switchToMe();
    partBoxArray[id].adjust(vpMatrix);
    partBoxArray[id].draw();
}

function addRandVel() {

  if (settings.ForceField) {
    partBoxArray[0].partVec.addRandVelocityToAll(
        0.2 * INIT_VEL, INIT_VEL, 
        0.2 * INIT_VEL, INIT_VEL,
        0.2 * INIT_VEL, INIT_VEL
    );
  }
  if (settings.Boid) {
    partBoxArray[1].partVec.addRandVelocityToAll(
        0.2 * INIT_VEL, INIT_VEL, 
        0.2 * INIT_VEL, INIT_VEL,
        0.2 * INIT_VEL, INIT_VEL
    );
  }
  if (settings.Flame) {
    partBoxArray[2].partVec.addRandVelocityToAll(
        0.2 * INIT_VEL, INIT_VEL, 
        0.2 * INIT_VEL, INIT_VEL,
        0.2 * INIT_VEL, INIT_VEL
    );
  }
  if (settings.Springs) {
    partBoxArray[3].partVec.addRandVelocityToAll(
        0.2 * INIT_VEL, INIT_VEL, 
        0.2 * INIT_VEL, INIT_VEL,
        0.2 * INIT_VEL, INIT_VEL
    );
  }
}

function setGlobalSolver() {
  if (settings.Solver == 0) {
    solverFunc = solverLib.Explicit;
  } else if (settings.Solver == 1) {
    solverFunc = solverLib.Implicit;
  } else if (settings.Solver == 2) {
    solverFunc = solverLib.MidPoint;
  } else if (settings.Solver == 3) {
    solverFunc = solverLib.IterativeEuler;
  } else if (settings.Solver == 4) {
    solverFunc = solverLib.IterativeMidPoint;
  } else if (settings.Solver == 5) {
    solverFunc = solverLib.Verlet;
  } else if (settings.Solver == 6) {
    solverFunc = solverLib.VelocityVerlet;
  }
}