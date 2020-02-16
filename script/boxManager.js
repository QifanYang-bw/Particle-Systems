var solverFunc;

function initBoxes() {

  gridBox = new VboGrid();

  partBoxArray = [new VboFountain(), new VboMultiSpring()];

  gridBox.init();

  for (var i = 0; i < partBoxArray.length; i++) {
    partBoxArray[i].init();
  }

  defaultVec = partBoxArray[0].partVec;

}

function renderBoxes(vpMatrix) {

  if (settings.Solver == 0) {
    solverFunc = solverLib.Explicit;
  } else if (settings.Solver == 1) {
    solverFunc = solverLib.Implicit;
  }

  if (settings.Flame) {
    partBoxArray[0].switchToMe();
    partBoxArray[0].adjust(vpMatrix);
    partBoxArray[0].draw();
  }

  if (settings.Springs) {
    partBoxArray[1].switchToMe();
    partBoxArray[1].adjust(vpMatrix);
    partBoxArray[1].draw();
  }

  gridBox.switchToMe();
  gridBox.adjust(vpMatrix);
  gridBox.draw();

}