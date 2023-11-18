function magicStroke(canvasPriorID, canvasNextID) {
  let lines = _lineDiff(canvasPriorID, canvasNextID);
  const longest = _longestLine(lines);
  const stroke = _lineToComponents(longest);
  console.log("MAGIC:", "stroke:", stroke || "no stroke found");
  return stroke;
}

function _lineToComponents(line) {
  if (!line) {
    return;
  }
  const [x1, y1, x2, y2] = line;
  const dx = x2 - x1;
  const dy = y2 - y1;
  return [Math.round(dx), Math.round(dy)];
}

function _longestLine(lines) {
  if (!lines || lines.length === 0) {
    return;
  }
  let longestLine = lines[0];
  let longestLineLength = 0;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let lineLength = Math.sqrt(
      Math.pow(line[2] - line[0], 2) + Math.pow(line[3] - line[1], 2),
    );
    if (lineLength > longestLineLength) {
      longestLine = line;
      longestLineLength = lineLength;
    }
  }
  return longestLine;
}

function _lineDiff(canvasPriorID, canvasNextID) {
  console.log("MAGIC:", "Generating Image Line Diff");
  const image1 = cv.imread(canvasPriorID);
  const image2 = cv.imread(canvasNextID);

  // Convert Images to Grayscale
  let image1_gray = new cv.Mat();
  let image2_gray = new cv.Mat();
  cv.cvtColor(image1, image1_gray, cv.COLOR_RGBA2GRAY);
  cv.cvtColor(image2, image2_gray, cv.COLOR_RGBA2GRAY);

  // Calculate Absolute Difference
  let diff = new cv.Mat();
  cv.absdiff(image1_gray, image2_gray, diff);

  // Thresholding
  let thresholdValue = 50; // Adjust as needed
  cv.threshold(diff, diff, thresholdValue, 255, cv.THRESH_BINARY);

  // // Show image diff
  // cv.imshow("diffCanvas", diff);

  // Find Contours
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
    diff,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE,
  );

  // Filter Contours
  let minContourArea = 10; // Adjust as needed

  console.log("MAGIC:", "Number of Contours:", contours.size());

  newLines = [];
  for (let i = 0; i < contours.size(); ++i) {
    let contour = contours.get(i);
    let area = cv.contourArea(contour);
    if (area > minContourArea) {
      // Fit Rotated Rectangle to Contours
      let rotatedRect = cv.minAreaRect(contour);

      // Extract position, angle, and size from the rotated rectangle
      let center = rotatedRect.center;
      let angle = rotatedRect.angle;
      let size = rotatedRect.size;

      // Calculate the start and end points of the line
      let length = Math.max(size.width, size.height) / 2;

      let angleRad = angle * (Math.PI / 180); // Convert angle to radians
      let startX = center.x - length * Math.cos(angleRad);
      let startY = center.y - length * Math.sin(angleRad);
      let endX = center.x + length * Math.cos(angleRad);
      let endY = center.y + length * Math.sin(angleRad);

      // Process start and end coordinates
      console.log("MAGIC:", "Start Coordinates:", startX, startY);
      console.log("MAGIC:", "End Coordinates:", endX, endY);
      console.log("MAGIC:", "delta: [", endX - startX, ",", endY - startY, "]");
      newLines.push([startX, startY, endX, endY]);
    }
  }

  // Release Mats to free up memory
  image1_gray.delete();
  image2_gray.delete();
  diff.delete();
  contours.delete();
  hierarchy.delete();

  console.log("MAGIC:", "Number of Lines:", newLines.length);

  drawLines(newLines, image1.cols, image1.rows);
  return newLines;
}
