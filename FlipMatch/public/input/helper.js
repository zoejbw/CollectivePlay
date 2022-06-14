function calculate_flipY() {
  // Calculate the latest flipY
  flipY = purify_flipY(round(rotationY));
  if (pFlipY == 180) {
    // Init pFlipY
    pFlipY = flipY;
  }

  // Calsulate if the phone is flipping open or closed
  if (pFlipY > flipY && pFlipY * flipY > 0) {
    // Flipping to open
    flipToShow = true;
  } else if (pFlipY < flipY && pFlipY * flipY > 0) {
    // Flipping to close
    flipToShow = false;
  }
  
  pFlipY = flipY;
}

function purify_flipY(y) {
  // When the phone is close to flat, make it flat
  if (abs(y) < 7) {
    return 0;
  } else {
    return y;
  }
}