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

  // show snapshot/webcam
  if(snapshot) image(snapshot, 0, 0, cellW, cellH)
  else image(webcam, 0, 0, cellW, cellH)

  // show grayscale image + 20% brightness
  if (grayBrightImg) image(grayBrightImg, cellW, 0, cellW, cellH)

  // show red, green and blue channel images
  if(redImg)   image(redImg, 0, cellH, cellW, cellH)
  if(greenImg) image(greenImg, cellW, cellH, cellW, cellH)
  if(blueImg)  image(blueImg, cellW*2, cellH, cellW, cellH)
  
  // create/update threshold images if RGB channels are available
  if (redImg && greenImg && blueImg) {
    thrRedImg   = createChannelImage(snapshot, "r", threshR.value());
    thrGreenImg = createChannelImage(snapshot, "g", threshG.value());
    thrBlueImg  = createChannelImage(snapshot, "b", threshB.value());
  }

  // show threshold images
  if(thrRedImg)   image(thrRedImg, 0, cellH*2, cellW, cellH)
  if(thrGreenImg) image(thrGreenImg, cellW, cellH*2, cellW, cellH)
  if(thrBlueImg)  image(thrBlueImg, cellW*2, cellH*2, cellW, cellH)

  if(snapshot) image(snapshot, 0, cellH*3, cellW, cellH)
  if(hsvImg)   image(hsvImg, cellW, cellH*3, cellW, cellH)
  if(labImg)   image(labImg, cellW*2, cellH*3, cellW, cellH)

  if(thrHSVImg && thrLabImg){
    applyThresholdCSImages()
    image(thrHSVImg, cellW, cellH*4, cellW, cellH)
    image(thrLabImg, cellW*2, cellH*4, cellW, cellH)
  }

  if(webcam) createFaceDetection()

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
    // creates grayscale + brightness image
    grayBrightImg = createGrayscaleFromSnapshot();
    // creates RGB channel images
    createRGBChannelsFromSnapshot()
    // creates threshold images
    thrRedImg   = createChannelImage(snapshot, "r", threshR.value());
    thrGreenImg = createChannelImage(snapshot, "g", threshG.value());
    thrBlueImg  = createChannelImage(snapshot, "b", threshB.value());
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

//////////////////////////////////////////////
// GRAYSCALE + BRIGHTNESS +20% //
//////////////////////////////////////////////
function createGrayscaleFromSnapshot() {
  let img = createImage(cellW, cellH);
  let applyBrightness = true;
  img.copy(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, cellW, cellH);
  applyGrayscale(img, applyBrightness);
  return img;
}

function applyGrayscale(img, applyBrightness) {2
  img.loadPixels()
  // runs through the array in one single loop following the 4-value-pixel rule (and skipping alpha)
  for (let i = 0; i < img.pixels.length; i += 4) {
    let r = img.pixels[i]
    let g = img.pixels[i + 1]
    let b = img.pixels[i + 2]
    
    // average grayscale
    let gray = (r + g + b) / 3

    if(applyBrightness) gray = constrain(gray * 1.2, 0, 255)

    // sets pixels to average graysscale
    img.pixels[i] = gray
    img.pixels[i + 1] = gray
    img.pixels[i + 2] = gray
  }
  img.updatePixels()
}

///////////////////////////////////////////////
// RGB CHANNELS + THRESHOLDS //
///////////////////////////////////////////////
function createRGBChannelsFromSnapshot() {
  redImg   = createChannelImage(snapshot, 'r');
  greenImg = createChannelImage(snapshot, 'g');
  blueImg  = createChannelImage(snapshot, 'b');
}

function createChannelImage(srcImg, channel, threshold = null) {
  let img = createImage(cellW, cellH);
  img.loadPixels();
  srcImg.loadPixels();

  // runs through the array in one single loop following the 4-value-pixel rule (and skipping alpha)
  for (let i = 0; i < srcImg.pixels.length; i += 4) {
    let r = srcImg.pixels[i];
    let g = srcImg.pixels[i + 1];
    let b = srcImg.pixels[i + 2];
    let a = srcImg.pixels[i + 3];

    // initialize final channel values to zero
    let final_r = 0, final_g = 0, final_blue = 0;

    // set the selected channel to its original value (or 0 if below threshold)
    if (channel === 'r') {
      final_r = threshold !== null ? (r > threshold ? r : 0) : r;
    } else if (channel === 'g') {
      final_g = threshold !== null ? (g > threshold ? g : 0) : g;
    } else if (channel === 'b') {
      final_blue = threshold !== null ? (b > threshold ? b : 0) : b;
    }

    // set pixel values in the new image
    img.pixels[i]     = final_r;
    img.pixels[i + 1] = final_g;
    img.pixels[i + 2] = final_blue;
    img.pixels[i + 3] = a;
  }

  img.updatePixels();
  return img;
}

//////////////////////////////////////////////
// COLOR SPACE CONVERSIONS + THRESHOLDS //
//////////////////////////////////////////////
// ref: Colour Space Conversions (PDF) - Page 15
function rgbToHSV(r, g, b) {
  //  normalizes red, green and blue channel values
  r /= 255; g /= 255; b /= 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let delta = max - min;

  // value
  let V = max;

  // saturation
  let S = max === 0 ? 0 : delta / max;

  let R0 = delta === 0 ? 0 : (max - r) / delta;
  let G0 = delta === 0 ? 0 : (max - g) / delta;
  let B0 = delta === 0 ? 0 : (max - b) / delta;

  // hue
  let H;
  if (S === 0) H = 0;
  else if (r === max && g === min) H = 5 + B0;
  else if (r === max && g !== min) H = 1 - G0;
  else if (g === max && b === min) H = R0 + 1;
  else if (g === max && b !== min) H = 3 - B0;
  else if (r === max) H = 3 + G0;
  else H = 5 - R0;

  H = (H * 60) % 360;

  // returns HSV values scaled to 0-255 range
  return [H / 360 * 255, S * 255, V * 255];
}

function createHSVImage() {
  hsvImg = createImage(cellW, cellH);
  hsvImg.loadPixels();

  // runs through the array in one single loop following the 4-value-pixel rule (and skipping alpha)
  for (let i = 0; i < snapshot.pixels.length; i += 4) {
    let r = snapshot.pixels[i];
    let g = snapshot.pixels[i + 1];
    let b = snapshot.pixels[i + 2];
    let a = snapshot.pixels[i + 3];

    // calculates HSV values using the rgbToHSV function
    let [H, S, V] = rgbToHSV(r, g, b);

    // sets pixel values in the new image
    hsvImg.pixels[i]     = H;
    hsvImg.pixels[i + 1] = S;
    hsvImg.pixels[i + 2] = V;
    hsvImg.pixels[i + 3] = a;
  }

  hsvImg.updatePixels();
}

// ref: https://kaizoudou.com/from-rgb-to-lab-color-space/
function rgbToLab(r, g, b) {
  // normalizes red, green and blue channel values
  r /= 255; g /= 255; b /= 255;

  // gamma correction
  r = (r > 0.04045) ? pow((r + 0.055)/1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? pow((g + 0.055)/1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? pow((b + 0.055)/1.055, 2.4) : b / 12.92;

  // convert to XYZ color space
  let X = (r*0.4124 + g*0.3576 + b*0.1805) * 100;
  let Y = (r*0.2126 + g*0.7152 + b*0.0722) * 100;
  let Z = (r*0.0193 + g*0.1192 + b*0.9505) * 100;

  // referencia blanco D65
  const Xn = 95.047, Yn = 100.0, Zn = 108.883;

  // convert to LAB color space using f(t) function
  function f(t) { return t > 0.008856 ? pow(t, 1/3) : (7.787 * t + 16/116); }

  // calculate L*, a* and b*
  let L = (Y / Yn > 0.008856) ? 116 * pow(Y / Yn, 1/3) - 16 : 903.3 * (Y / Yn);
  let aLab = 500 * (f(X / Xn) - f(Y / Yn));
  let bLab = 200 * (f(Y / Yn) - f(Z / Zn));

  // returns L*, a* and b* values scaled to 0-255 range
  return [constrain(L / 100 * 255, 0, 255), constrain(aLab + 128, 0, 255), constrain(bLab + 128, 0, 255)];
}

function createLabImage() {
  labImg = createImage(cellW, cellH);
  labImg.loadPixels();
  snapshot.loadPixels();

  // runs through the array in one single loop
  for (let i = 0; i < snapshot.pixels.length; i += 4) {
    let r = snapshot.pixels[i];
    let g = snapshot.pixels[i + 1];
    let b = snapshot.pixels[i + 2];
    let a = snapshot.pixels[i + 3];

    // calculates LAB values using the rgbToLab function
    let [L, aLab, bLab] = rgbToLab(r, g, b);

    // sets pixel values in the new image
    labImg.pixels[i]     = L;
    labImg.pixels[i + 1] = aLab;
    labImg.pixels[i + 2] = bLab;
    labImg.pixels[i + 3] = a;
  }

  labImg.updatePixels();
}

function createThresholdCSImages() {
    thrHSVImg = createImage(cellW, cellH)
    thrLabImg = createImage(cellW, cellH)
}

function applyThreshold(imgSrc, imgDst, channelIdx, threshold) {
  imgDst.loadPixels();
  imgSrc.loadPixels(); // ensure source image pixels are loaded

  for (let i = 0; i < imgSrc.pixels.length; i += 4) {
    let value = imgSrc.pixels[i + channelIdx];
    let a = imgSrc.pixels[i + 3];

    // applies threshold to the selected channel (R=0, G=1, B=2)
    if (value > threshold) {
      imgDst.pixels[i]     = imgSrc.pixels[i];
      imgDst.pixels[i + 1] = imgSrc.pixels[i + 1];
      imgDst.pixels[i + 2] = imgSrc.pixels[i + 2];
    } else {
      imgDst.pixels[i] = imgDst.pixels[i + 1] = imgDst.pixels[i + 2] = 0;
    }

    // preserves alpha channel
    imgDst.pixels[i + 3] = a;
  }

  imgDst.updatePixels();
}

function applyThresholdCSImages() {
  applyThreshold(hsvImg, thrHSVImg, 2, threshHSV.value()); // V channel
  applyThreshold(labImg, thrLabImg, 0, threshLAB.value()); // L* channel
}

//////////////////////////////////////////////
// FACE DETECTION + FILTERS //
//////////////////////////////////////////////
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
        if (faceMode === 1) applyGrayscale(faceCrop, false)
        else if (faceMode === 2) applyBlur(faceCrop)
        else if (faceMode === 3) applyHSV(faceCrop)
        else if (faceMode === 4) applyPixelate(faceCrop, 5, false)
        else if (faceMode === 5) applyPixelate(faceCrop, 5, true)

        image(faceCrop, face[0], face[1] + cellH * 4)
      }
    }
  }
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
    for (let i = 0; i < tempImg.pixels.length; i += 4) {
    let r = tempImg.pixels[i];
    let g = tempImg.pixels[i + 1];
    let b = tempImg.pixels[i + 2];
    let a = tempImg.pixels[i + 3];

    // calculates HSV values using the rgbToHSV function
    let [H, S, V] = rgbToHSV(r, g, b);
    
    // sets pixel values in the new image
    tempImg.pixels[i]     = H;
    tempImg.pixels[i + 1] = S;
    tempImg.pixels[i + 2] = V;
    tempImg.pixels[i + 3] = a;
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