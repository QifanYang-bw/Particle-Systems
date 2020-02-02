function initBoxes() {

  gridBox = new VboGrid();
  partBox = new VboSplatter();

  gridBox.init();
  partBox.init();

  defaultVec = partBox.partVec;

}

function renderBoxes(vpMatrix) {

  partBox.switchToMe();
  partBox.adjust(vpMatrix);
  partBox.draw();

  gridBox.switchToMe();
  gridBox.adjust(vpMatrix);
  gridBox.draw();

}