function initBoxes() {

  gridBox = new VboGrid();
  partBox = new VboSplatter();

  gridBox.init();
  partBox.init();

  defaultVec = partBox.partVec;

}