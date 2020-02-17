var solverFunc;

function initBoxes() {

  gridBox = new VboGrid();

  partBoxArray = [new VboBoid(), new VboFire(), new VboMultiSpring()];

  // partBoxArray = [new VboFire(), null];

  gridBox.init();

  for (var i = 0; i < partBoxArray.length; i++) {
    if (partBoxArray[i] != null) partBoxArray[i].init();
  }

  defaultVec = partBoxArray[0].partVec;

}

function renderBoxes(vpMatrix) {

  if (settings.Solver == 0) {
    solverFunc = solverLib.Explicit;
  } else if (settings.Solver == 1) {
    solverFunc = solverLib.Implicit;
  }

  if (settings.Boid) {
    partBoxArray[0].switchToMe();
    partBoxArray[0].adjust(vpMatrix);
    partBoxArray[0].draw();
  }

  if (settings.Flame) {
    partBoxArray[1].switchToMe();
    partBoxArray[1].adjust(vpMatrix);
    partBoxArray[1].draw();
  }

  if (settings.Springs) {
    partBoxArray[2].switchToMe();
    partBoxArray[2].adjust(vpMatrix);
    partBoxArray[2].draw();
  }

  gridBox.switchToMe();
  gridBox.adjust(vpMatrix);
  gridBox.draw();

}