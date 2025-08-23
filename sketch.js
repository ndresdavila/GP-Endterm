let webcam
let snapshot

let detector
let classifier = objectdetect.frontalface
let faceImg

// grayscale image +20% brightness
let grayBrightImg

// channel images
let redImg, greenImg, blueImg

// threshold images
let thrRedImg, thrGreenImg, thrBlueImg

// sliders
let threshR, threshG, threshB

// filter images
let hsvImg, labImg;
let thrHSVImg, thrLabImg
let threshHSV, threshLAB

let faceMode = 0

let vhsImg
let vhsFont;

// cell's dimensions
const cellW = 160
const cellH = 120

function preload() {
  // vintage style font (VT323 from Google Fonts)
  vhsFont = loadFont("https://fonts.gstatic.com/s/vt323/v17/pxiKyp0ihIEF2isfFJA.ttf");
}

function setup(){
  createCanvas(cellW * 3, cellH * 5); // 3 rows and 5 columns
  pixelDensity(1);
  webcam = createCapture(VIDEO)
  webcam.size(640, 480)
  webcam.hide()

  let scaleFactor = 1.2
  detector = new objectdetect.detector(cellW, cellH, scaleFactor, classifier)
  faceImg = createImage(cellW, cellH)

  // sliders
  threshR = createSlider(0,255,128)
  threshR.size(cellW-20, 15)
  threshR.position(0 + 10, cellH*2 + cellH - 20)

  threshG = createSlider(0,255,128)
  threshG.size(cellW-20, 15)
  threshG.position(cellW + 10, cellH*2 + cellH - 20)

  threshB = createSlider(0,255,128)
  threshB.size(cellW-20, 15)
  threshB.position(cellW*2 + 10, cellH*2 + cellH - 20)

  threshHSV = createSlider(0, 255, 128)
  threshHSV.size(cellW-20, 15)
  threshHSV.position(cellW + 10, cellH*4 + cellH - 20)

  threshLAB = createSlider(0, 255, 128)
  threshLAB.size(cellW-20, 15)
  threshLAB.position(cellW*2 + 10, cellH*4 + cellH - 20)
}

function draw(){
  background(220)

  // draws grid
  drawGridPlaceholders()

  // show snapshot/webcam in row 1 col 1
  if(snapshot) image(snapshot, 0, 0, cellW, cellH)
  else image(webcam, 0, 0, cellW, cellH)

  // show grayscale image + 20% brightness in row 1 col 2
  if (grayBrightImg) image(grayBrightImg, cellW, 0, cellW, cellH)

  // show red, green and blue channels
  if(redImg)   image(redImg, 0, cellH, cellW, cellH)
  if(greenImg) image(greenImg, cellW, cellH, cellW, cellH)
  if(blueImg)  image(blueImg, cellW*2, cellH, cellW, cellH)

  // show threshold images
  if(redImg)   image(thrRedImg, 0, cellH*2, cellW, cellH)
  if(greenImg) image(thrGreenImg, cellW, cellH*2, cellW, cellH)
  if(blueImg)  image(thrBlueImg, cellW*2, cellH*2, cellW, cellH)

  if(snapshot) image(snapshot, 0, cellH*3, cellW, cellH)
  if(hsvImg)   image(hsvImg, cellW, cellH*3, cellW, cellH)
  if(labImg)   image(labImg, cellW*2, cellH*3, cellW, cellH)

  if(thrHSVImg && thrLabImg){
    applyThresholdCSImages()
    image(thrHSVImg, cellW, cellH*4, cellW, cellH)
    image(thrLabImg, cellW*2, cellH*4, cellW, cellH)
  }

  if(webcam) createFaceDetection()
  if(redImg) applyThresholds()

  // showS VHS effect in row 1, column 3
  if (webcam) {
    vhsImg = webcam.get();           // captureS current frame from the webcam
    vhsImg.resize(cellW, cellH);     // resizeS to cell dimensions
    vhsImg = applyVHSEffect(vhsImg); // applies VHS effect
    image(vhsImg, cellW*2, 0, cellW, cellH);  

    // drawS the date in the top-right corner
    push();
    textFont(vhsFont);     // set VHS-style font
    textSize(12);          // set font size
    fill(255, 255, 255);   // white text
    stroke(0);             // black stroke for contrast
    strokeWeight(1);       // stroke thickness
    textAlign(RIGHT, TOP); // align text to top-right corner

    // create date string in format YYYY-MM-DD HH:MM:SS
    let dateStr = nf(year(), 4) + '-' + nf(month(), 2) + '-' + nf(day(), 2) + ' ' + nf(hour(), 2) + ':' + nf(minute(), 2) + ':' + nf(second(), 2);

    // draw text with 5px margin from edges
    text(dateStr, cellW*3 - 5, 5);
    pop();
  }
}

// draws placeholders with their title
function drawGridPlaceholders() {
  textAlign(CENTER, CENTER)
  textSize(10)

  let labels = [
    ["Webcam image", "Grayscale + Brightness +20%", "VHS Effect"],
    ["Red channel", "Green channel", "Blue channel"],
    ["Threshold R", "Threshold G", "Threshold B"],
    ["Webcam (repeat)", "HSV", "L*a*b*"],
    ["Face detection", "Thresh (CS1)", "Thresh (CS2)"]
  ]

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      let x = col * cellW
      let y = row * cellH
      rect(x, y, cellW, cellH) // draws cell
      fill(0)
      noStroke()
      text(labels[row][col], x + cellW/2, y + cellH/2)
      noFill()
      stroke(150)
    }
  }
}

// takes snapshot with spacebar and creates the different images
function keyPressed() {
  if(key===' '){
    takeSnapshot()
    createGrayBright()
    createRGBChannels()
    createThresholdImages()
    createHSVImage()
    createLabImage()
    createThresholdCSImages()
  }
  if (key === '0') faceMode = 0
  if (key === '1') faceMode = 1
  if (key === '2') faceMode = 2
  if (key === '3') faceMode = 3
  if (key === '4') faceMode = 4
  if (key === '5') faceMode = 5
}

function takeSnapshot() {

  // captures current image
  snapshot = webcam.get()

  // resizing to minimum resolution
  snapshot.resize(cellW, cellH)

  // loads pixels
  snapshot.loadPixels()
}

function createGrayBright() {
  // creates graysacle +20% brightness image
  grayBrightImg = createImage(cellW, cellH)
  grayBrightImg.loadPixels()

  for (let y = 0; y < cellH; y++) {
    for (let x = 0; x < cellW; x++) {
      let idx = (y * cellW + x) * 4
      let r = snapshot.pixels[idx]
      let g = snapshot.pixels[idx+1]
      let b = snapshot.pixels[idx+2]
      let a = snapshot.pixels[idx+3]

      // average grayscale
      let avg = (r + g + b) / 3
      // +20% brightness withour surpassing 255
      avg = constrain(avg * 1.2, 0, 255)

      // sets pixels to average grayscale
      grayBrightImg.pixels[idx]   = avg
      grayBrightImg.pixels[idx+1] = avg
      grayBrightImg.pixels[idx+2] = avg
      grayBrightImg.pixels[idx+3] = a
    }
  }

  grayBrightImg.updatePixels()
}

function createRGBChannels() {
  // creates red, green and blue channel images
  redImg   = createImage(cellW, cellH)
  greenImg = createImage(cellW, cellH)
  blueImg  = createImage(cellW, cellH)

  redImg.loadPixels()
  greenImg.loadPixels()
  blueImg.loadPixels()

  for(let y=0; y<cellH; y++){
    for(let x=0; x<cellW; x++){
      let idx = (y*cellW + x)*4
      let r = snapshot.pixels[idx]
      let g = snapshot.pixels[idx+1]
      let b = snapshot.pixels[idx+2]
      let a = snapshot.pixels[idx+3]

      // red channel
      redImg.pixels[idx]   = r
      redImg.pixels[idx+1] = 0
      redImg.pixels[idx+2] = 0
      redImg.pixels[idx+3] = a

      // green channel
      greenImg.pixels[idx]   = 0
      greenImg.pixels[idx+1] = g
      greenImg.pixels[idx+2] = 0
      greenImg.pixels[idx+3] = a

      // blue channel
      blueImg.pixels[idx]   = 0
      blueImg.pixels[idx+1] = 0
      blueImg.pixels[idx+2] = b
      blueImg.pixels[idx+3] = a
    }
  }

  redImg.updatePixels()
  greenImg.updatePixels()
  blueImg.updatePixels()
}

function createThresholdImages() {
  thrRedImg = createImage(cellW, cellH);
  thrGreenImg = createImage(cellW, cellH);
  thrBlueImg = createImage(cellW, cellH);
}

function applyThresholds(){
  thrRedImg.loadPixels()
  thrGreenImg.loadPixels()
  thrBlueImg.loadPixels()

  for(let y=0; y<cellH; y++){
    for(let x=0; x<cellW; x++){
      let idx = (y*cellW + x)*4

      let r = snapshot.pixels[idx]
      let g = snapshot.pixels[idx+1]
      let b = snapshot.pixels[idx+2]
      let a = snapshot.pixels[idx+3]

      // Red channel threshold
      thrRedImg.pixels[idx]   = r > threshR.value() ? r : 0
      thrRedImg.pixels[idx+1] = 0
      thrRedImg.pixels[idx+2] = 0
      thrRedImg.pixels[idx+3] = a

      // Green channel threshold
      thrGreenImg.pixels[idx]   = 0
      thrGreenImg.pixels[idx+1] = g > threshG.value() ? g : 0
      thrGreenImg.pixels[idx+2] = 0
      thrGreenImg.pixels[idx+3] = a

      // Blue channel threshold
      thrBlueImg.pixels[idx]   = 0
      thrBlueImg.pixels[idx+1] = 0
      thrBlueImg.pixels[idx+2] = b > threshB.value() ? b : 0
      thrBlueImg.pixels[idx+3] = a
    }
  }

  thrRedImg.updatePixels()
  thrGreenImg.updatePixels()
  thrBlueImg.updatePixels()
}

// ref: Colour Space Conversions (PDF) - Page 15
function createHSVImage() {
  hsvImg = createImage(cellW, cellH)
  hsvImg.loadPixels()

  for (let y = 0; y < cellH; y++) {
    for (let x = 0; x < cellW; x++) {
      let idx = (y * cellW + x) * 4

      // normalized RGB values (0-1)
      let r = snapshot.pixels[idx] / 255
      let g = snapshot.pixels[idx + 1] / 255
      let b = snapshot.pixels[idx + 2] / 255
      let a = snapshot.pixels[idx + 3]

      // max, min, delta
      let max = Math.max(r, g, b)
      let min = Math.min(r, g, b)
      let delta = max - min

      // value
      let V = max

      // saturation
      let S = max === 0 ? 0 : delta / max

      // R', G', B' (avoid division by zero)
      let R0 = delta === 0 ? 0 : (max - r) / delta
      let G0 = delta === 0 ? 0 : (max - g) / delta
      let B0 = delta === 0 ? 0 : (max - b) / delta

      // hue
      let H;
      if (S === 0) H = 0;
      else if (r === max && g === min) H = 5 + B0
      else if (r === max && g !== min) H = 1 - G0
      else if (g === max && b === min) H = R0 + 1
      else if (g === max && b !== min) H = 3 - B0
      else if (r === max) H = 3 + G0
      else H = 5 - R0

      // converts H to degrees (0-360)
      H = (H * 60) % 360

      // visualization
      hsvImg.pixels[idx]     = H / 360 * 255
      hsvImg.pixels[idx + 1] = S * 255
      hsvImg.pixels[idx + 2] = V * 255
      hsvImg.pixels[idx + 3] = a
    }
  }
  hsvImg.updatePixels()
}

// ref: https://kaizoudou.com/from-rgb-to-lab-color-space/
function createLabImage() {
  labImg = createImage(cellW, cellH)
  labImg.loadPixels()

  // reference white point for D65 illuminant
  const Xn = 95.047
  const Yn = 100.000
  const Zn = 108.883

  for (let y = 0; y < cellH; y++) {
    for (let x = 0; x < cellW; x++) {
      let idx = (y * cellW + x) * 4

      // normalized RGB values (0-1)
      let r = snapshot.pixels[idx] / 255
      let g = snapshot.pixels[idx + 1] / 255
      let b = snapshot.pixels[idx + 2] / 255
      let alpha = snapshot.pixels[idx + 3]

      // apply gamma correction
      r = (r > 0.04045) ? pow((r + 0.055)/1.055, 2.4) : r / 12.92
      g = (g > 0.04045) ? pow((g + 0.055)/1.055, 2.4) : g / 12.92
      b = (b > 0.04045) ? pow((b + 0.055)/1.055, 2.4) : b / 12.92

      // convert to XYZ color space
      let X = (r*0.4124 + g*0.3576 + b*0.1805) * 100
      let Y = (r*0.2126 + g*0.7152 + b*0.0722) * 100
      let Z = (r*0.0193 + g*0.1192 + b*0.9505) * 100

      // convert to LAB color space using f(t) function
      function f(t) {
          return t > 0.008856 ? pow(t, 1/3) : (7.787 * t + 16/116)
      }

      let L = (Y / Yn > 0.008856) ? 116 * pow(Y / Yn, 1/3) - 16 : 903.3 * (Y / Yn)
      let aLab = 500 * (f(X / Xn) - f(Y / Yn))
      let bLab = 200 * (f(Y / Yn) - f(Z / Zn))

      // visualization
      labImg.pixels[idx]     = constrain(L / 100 * 255, 0, 255)  // L*
      labImg.pixels[idx + 1] = constrain(aLab + 128, 0, 255)     // a*
      labImg.pixels[idx + 2] = constrain(bLab + 128, 0, 255)     // b*
      labImg.pixels[idx + 3] = alpha
    }
  }

  labImg.updatePixels()
}

function createThresholdCSImages() {
    thrHSVImg = createImage(cellW, cellH)
    thrLabImg = createImage(cellW, cellH)
}

function applyThresholdCSImages(){

  thrHSVImg.loadPixels()
  thrLabImg.loadPixels()

  for (let y = 0; y < cellH; y++){
    for (let x = 0; x < cellW; x++){
      let idx = (y * cellW + x) * 4

      // HSV threshold (V channel)
      let v = hsvImg.pixels[idx + 2] // V channel
      let a = hsvImg.pixels[idx + 3] // alpha (transparency value)

      if(v > threshHSV.value()){
        // keeps original colors
        thrHSVImg.pixels[idx]   = hsvImg.pixels[idx]
        thrHSVImg.pixels[idx+1] = hsvImg.pixels[idx+1]
        thrHSVImg.pixels[idx+2] = hsvImg.pixels[idx+2]
      } else {
        // otherwise, turns them black
        thrHSVImg.pixels[idx]   = 0
        thrHSVImg.pixels[idx+1] = 0
        thrHSVImg.pixels[idx+2] = 0
      }
      thrHSVImg.pixels[idx+3] = a

      // LAB treshold
      let l = labImg.pixels[idx]       // L* channel
      let aLab = labImg.pixels[idx+3]  // a* channel

      if(l > threshLAB.value()){
        // keeps original colors
        thrLabImg.pixels[idx]   = labImg.pixels[idx]
        thrLabImg.pixels[idx+1] = labImg.pixels[idx+1]
        thrLabImg.pixels[idx+2] = labImg.pixels[idx+2]
      } else {
        // otherwise, turns them black
        thrLabImg.pixels[idx]   = 0
        thrLabImg.pixels[idx+1] = 0
        thrLabImg.pixels[idx+2] = 0
      }
      thrLabImg.pixels[idx+3] = aLab
    }
  }

  thrHSVImg.updatePixels()
  thrLabImg.updatePixels()
}

function createFaceDetection() {
  if(webcam){
    // copies webcam frame to faceImg and loads its pixels
    faceImg.copy(webcam, 0, 0, webcam.width, webcam.height, 0, 0, cellW, cellH)
    faceImg.loadPixels()

    // applies face detection on the frame
    faces = detector.detect(faceImg.canvas)

    // draws the resized webcam frame in its cell
    image(faceImg, 0, cellH*4, cellW, cellH)
  
    stroke(255, 255, 255)
    strokeWeight(2)
    noFill()
    for(let i=0; i<faces.length; i++){
      let face = faces[i]      
      // draws rectangle around detected face if confidence > threshold
      if(face[4] > 4) {
        rect(face[0], face[1] + cellH*4, face[2], face[3])

        // face crop image section
        let faceCrop = faceImg.get(face[0], face[1], face[2], face[3])

        // 4 modes of face detection
        if (faceMode === 1) applyGrayBrightness(faceCrop)
        else if (faceMode === 2) applyBlur(faceCrop)
        else if (faceMode === 3) applyHSV(faceCrop)
        else if (faceMode === 4) applyPixelate(faceCrop, 5, false)
        else if (faceMode === 5) applyPixelate(faceCrop, 5, true)

        image(faceCrop, face[0], face[1] + cellH * 4)
      }
    }
  }
}

function applyGrayBrightness(img) {
  img.loadPixels()
  // runs through the array in one single loop following the 4-value-pixel rule (and skipping alpha)
  for (let i = 0; i < img.pixels.length; i += 4) {
    let r = img.pixels[i]
    let g = img.pixels[i + 1]
    let b = img.pixels[i + 2]
    
    // average grayscale
    let gray = (r + g + b) / 3

    // sets pixels to average grayscale
    img.pixels[i] = gray
    img.pixels[i + 1] = gray
    img.pixels[i + 2] = gray
  }
  img.updatePixels()
}

function applyBlur(img) {

  factor = 8
  // creates a new image with dimensions reduced to 1/8 of the original size
  let small = createImage(int(img.width / factor), int(img.height / factor))
  
  // copies the original image inside the reduced image
  small.copy(img, 0, 0, img.width, img.height, 0, 0, small.width, small.height)
  
  // copies the reduced image back to the original image, making it look blurry
  img.copy(small, 0, 0, small.width, small.height, 0, 0, img.width, img.height)
}

function applyPixelate(img, blockSize, isColor) {
  img.loadPixels();

  // define dimensions as integers
  let width = Math.floor(img.width);
  let height = Math.floor(img.height);

  // iterate over each block (of size blockSize)
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {

      // variables that accumulate the value of each pixel in the current block
      let sumR = 0, sumG = 0, sumB = 0;
      let sumGray = 0;
      let count = 0;

      // iterates over each pixel inside the current block
      for (let j = 0; j < blockSize; j++) {
        for (let i = 0; i < blockSize; i++) {

          // coordinates of the current pixel inside the image
          let px = x + i;
          let py = y + j;

          // checks if current pixel (px, py) is inside the boundaries of the image
          if (px < width && py < height) {

            // calculate index of the pixel array to obtain the red, green and blue values
            let idx = 4 * (py * width + px);
            let r = img.pixels[idx];
            let g = img.pixels[idx + 1];
            let b = img.pixels[idx + 2];

            if (r === undefined || g === undefined || b === undefined) continue;

            // if isColor flag is set: accumulate values of each channel
            if (isColor) {
              sumR += r;
              sumG += g;
              sumB += b;
            } else {
              // otherwise convert to grayscale and accumulate that value
              let gray = (r + g + b) / 3;
              sumGray += gray;
            }
            count++;
          }
        }
      }

      // avoids division by zero in first iteration
      if (count === 0) continue;

      // calculate the average red, green and blue for each block
      let avgR, avgG, avgB;
      if (isColor) {
        avgR = sumR / count;
        avgG = sumG / count;
        avgB = sumB / count;
      } else {
        // set all color channels to the average gray value
        let gray = sumGray / count;
        avgR = avgG = avgB = gray;
      }

      // paint the block with the average color
      for (let j = 0; j < blockSize; j++) {
        for (let i = 0; i < blockSize; i++) {
          let px = x + i;
          let py = y + j;
          if (px < width && py < height) {
            let idx = 4 * (py * width + px);
            img.pixels[idx] = avgR;
            img.pixels[idx + 1] = avgG;
            img.pixels[idx + 2] = avgB;
          }
        }
      }
    }
  }

  img.updatePixels();
}

function applyHSV(img) {

  // sets a maximal dimension of 100x100 to avoid image overprocesing
  let maxDim = 100;
  let scaleFactor = 1;
  if (img.width > maxDim || img.height > maxDim) {
    scaleFactor = Math.min(maxDim / img.width, maxDim / img.height);
  }
  let tempW = Math.floor(img.width * scaleFactor);
  let tempH = Math.floor(img.height * scaleFactor);

  // creates a scaled copy of the original image 
  let tempImg = createImage(tempW, tempH);
  tempImg.copy(img, 0, 0, img.width, img.height, 0, 0, tempW, tempH);
  tempImg.loadPixels();

  // iterates over each pixel
  for (let y = 0; y < tempImg.height; y++) {
    for (let x = 0; x < tempImg.width; x++) {

      let idx = (y * tempImg.width + x) * 4;

      // normalizes red, green and blue channel values
      let r = tempImg.pixels[idx] / 255;
      let g = tempImg.pixels[idx + 1] / 255;
      let b = tempImg.pixels[idx + 2] / 255;

      // calculates HSV values as in the previous function (TODO: refactor)
      let max = Math.max(r, g, b);
      let min = Math.min(r, g, b);
      let delta = max - min;

      let V = max;
      let S = max === 0 ? 0 : delta / max;

      let R0 = delta === 0 ? 0 : (max - r) / delta;
      let G0 = delta === 0 ? 0 : (max - g) / delta;
      let B0 = delta === 0 ? 0 : (max - b) / delta;

      let H;
      if (S === 0) H = 0;
      else if (r === max && g === min) H = 5 + B0;
      else if (r === max && g !== min) H = 1 - G0;
      else if (g === max && b === min) H = R0 + 1;
      else if (g === max && b !== min) H = 3 - B0;
      else if (r === max) H = 3 + G0;
      else H = 5 - R0;

      H = (H * 60) % 360;

      tempImg.pixels[idx]     = (H / 360) * 255;
      tempImg.pixels[idx + 1] = S * 255;
      tempImg.pixels[idx + 2] = V * 255;
    }
  }
  // updates temporal image
  tempImg.updatePixels();

  // copies it back to the original image (scaling it)
  img.copy(tempImg, 0, 0, tempImg.width, tempImg.height, 0, 0, img.width, img.height);
}

function applyVHSEffect(img) {
  img.loadPixels();

  // converts from RGB to HSV
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let idx = (y * img.width + x) * 4;

      let r = img.pixels[idx] / 255;
      let g = img.pixels[idx + 1] / 255;
      let b = img.pixels[idx + 2] / 255;

      let max = Math.max(r, g, b);
      let min = Math.min(r, g, b);
      let delta = max - min;

      let H = 0;
      if (delta !== 0) {
        if (max === r) H = ((g - b) / delta) % 6;
        else if (max === g) H = (b - r) / delta + 2;
        else H = (r - g) / delta + 4;
        H *= 60;
        if (H < 0) H += 360;
      }

      let S = max === 0 ? 0 : delta / max;
      let V = max;

      // VHS adjustments (TODO: avoid magic numbers)
      H += random([-3, 3]);     // small displacement of hue
      S *= 0.75;                // reduced saturation
      V *= random(0.90, 1.10);  // random brightness variation

      // from HSV to RGB for visualization
      let C = V * S;
      let X = C * (1 - abs((H / 60) % 2 - 1));
      let m = V - C;

      let r1, g1, b1;
      if (H < 60) [r1, g1, b1] = [C, X, 0];
      else if (H < 120) [r1, g1, b1] = [X, C, 0];
      else if (H < 180) [r1, g1, b1] = [0, C, X];
      else if (H < 240) [r1, g1, b1] = [0, X, C];
      else if (H < 300) [r1, g1, b1] = [X, 0, C];
      else [r1, g1, b1] = [C, 0, X];

      r = (r1 + m) * 255 + random(-15, 15);
      g = (g1 + m) * 255 + random(-15, 15);
      b = (b1 + m) * 255 + random(-15, 15);

      img.pixels[idx]     = constrain(r, 0, 255);
      img.pixels[idx + 1] = constrain(g, 0, 255);
      img.pixels[idx + 2] = constrain(b, 0, 255);
    }
  }
  img.updatePixels();

  // chromatic shift
  let shifted = createImage(img.width, img.height);
  shifted.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
  shifted.loadPixels();

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let idx = (y * img.width + x) * 4;
      let shift = 2;

      let xR = constrain(x + shift, 0, img.width - 1);
      let idxR = (y * img.width + xR) * 4;

      let xB = constrain(x - shift, 0, img.width - 1);
      let idxB = (y * img.width + xB) * 4;

      shifted.pixels[idx]     = img.pixels[idxR];
      shifted.pixels[idx + 1] = img.pixels[idx + 1];
      shifted.pixels[idx + 2] = img.pixels[idxB + 2];
    }
  }

  // scanlines and white noise for VHS effect
  for (let y = 0; y < shifted.height; y++) {
    // horizonttal lines
    if (y % 2 === 0) {
      for (let x = 0; x < shifted.width; x++) {
        let idx = (y * shifted.width + x) * 4;
        shifted.pixels[idx]     *= 0.7;
        shifted.pixels[idx + 1] *= 0.7;
        shifted.pixels[idx + 2] *= 0.7;
      }
    }

    // small random white noise bands
    if (random() < 0.01) {
      let bandHeight = int(random(1, 3));
      for (let by = 0; by < bandHeight; by++) {
        let yy = constrain(y + by, 0, shifted.height - 1);
        for (let x = 0; x < shifted.width; x++) {
          let idx = (yy * shifted.width + x) * 4;
          let whiteNoise = random(150, 255);
          shifted.pixels[idx]     = whiteNoise;
          shifted.pixels[idx + 1] = whiteNoise;
          shifted.pixels[idx + 2] = whiteNoise;
        }
      }
    }
  }

  shifted.updatePixels();
  return shifted;
}
