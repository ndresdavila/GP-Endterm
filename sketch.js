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

  // face detector
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

function draw() {
  background(220);

  // draws grid and placeholders
  drawGridPlaceholders();

  // displays snapshot or webcam image
  displaySnapshotOrWebcam();

  // displays processed images
  displayProcessedImages();

  // draws face detection with selected effect
  if (webcam) createFaceDetection();

  // displays VHS effect
  if (webcam) displayVHSEffect();
}

//////////////////////////////////////////////
// // HELPER FUNCTIONS //
//////////////////////////////////////////////
function displaySnapshotOrWebcam() {
  if(snapshot) image(snapshot, 0, 0, cellW, cellH);
  else image(webcam, 0, 0, cellW, cellH);

  if (grayBrightImg) image(grayBrightImg, cellW, 0, cellW, cellH);
}

function displayProcessedImages() {
  // RGB channels
  if(redImg)   image(redImg, 0, cellH, cellW, cellH);
  if(greenImg) image(greenImg, cellW, cellH, cellW, cellH);
  if(blueImg)  image(blueImg, cellW*2, cellH, cellW, cellH);

  // Threshold channels
  if (redImg && greenImg && blueImg) {
    thrRedImg   = createChannelImage(snapshot, "r", threshR.value());
    thrGreenImg = createChannelImage(snapshot, "g", threshG.value());
    thrBlueImg  = createChannelImage(snapshot, "b", threshB.value());
  }

  // threshold images
  if(thrRedImg)   image(thrRedImg, 0, cellH*2, cellW, cellH);
  if(thrGreenImg) image(thrGreenImg, cellW, cellH*2, cellW, cellH);
  if(thrBlueImg)  image(thrBlueImg, cellW*2, cellH*2, cellW, cellH);

  // HSV / Lab
  if(snapshot) image(snapshot, 0, cellH*3, cellW, cellH);
  if(hsvImg)   image(hsvImg, cellW, cellH*3, cellW, cellH);
  if(labImg)   image(labImg, cellW*2, cellH*3, cellW, cellH);

  // Threshold HSV / Lab
  if(thrHSVImg && thrLabImg){
    applyThresholdCSImages();
    image(thrHSVImg, cellW, cellH*4, cellW, cellH);
    image(thrLabImg, cellW*2, cellH*4, cellW, cellH);
  }
}

// draws placeholders with their title
function drawGridPlaceholders() {
  textAlign(CENTER, CENTER)
  textSize(10)

  // labels for each cell
  let labels = [
    ["Webcam image", "Grayscale + Brightness +20%", "VHS Effect"],
    ["Red channel", "Green channel", "Blue channel"],
    ["Threshold R", "Threshold G", "Threshold B"],
    ["Webcam (repeat)", "HSV", "L*a*b*"],
    ["Face detection", "Thresh (CS1)", "Thresh (CS2)"]
  ]

  // draws grid
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
    
    // creates color space conversion images
    createHSVImage()
    createLabImage()
    createThresholdCSImages()
  }
  // face modes 0-5
  if (key === '0') faceMode = 0 // no effect
  if (key === '1') faceMode = 1 // grayscale
  if (key === '2') faceMode = 2 // blur
  if (key === '3') faceMode = 3 // HSV
  if (key === '4') faceMode = 4 // pixelate (grayscale)
  if (key === '5') faceMode = 5 // pixelate (color)
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

  // creates new image
  let img = createImage(cellW, cellH);
  let applyBrightness = true;

  // copies snapshot to img and applies grayscale + brightness
  img.copy(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, cellW, cellH);
  applyGrayscale(img, applyBrightness);
  return img;
}

function applyGrayscale(img, applyBrightness) {
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
  imgSrc.loadPixels(); // ensures source image pixels are loaded

  for (let i = 0; i < imgSrc.pixels.length; i += 4) {
    // gets the value of the selected channel
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

// array of detected faces
const faceEffects = {
  1: img => applyGrayscale(img, false),
  2: img => applyBlur(img),
  3: img => applyHSV(img),
  4: img => applyPixelate(img, 5, false),
  5: img => applyPixelate(img, 5, true),
};

function applyFaceEffect(img, mode) {
  if (faceEffects[mode]) faceEffects[mode](img); // applies effect if mode is valid
}

function processFace(faceImg, faceBox, mode, offsetY = 0) {
  let [x, y, w, h] = faceBox;
  let crop = faceImg.get(x, y, w, h);   // crops face
  applyFaceEffect(crop, mode);          // applies effect
  image(crop, x, y + offsetY);          // draws processed face
}

function detectFaces(img) {
  if (!detector) return [];
  let faces = detector.detect(img.canvas);  // detect faces
  return faces.filter(f => f[4] > 4);       // filter by confidence threshold
}

function drawFaces(faceImg, faces, mode, offsetY = 0) {
  stroke(255);
  strokeWeight(2);
  noFill();

  // draws rectangles and process each face
  for (let face of faces) {
    rect(face[0], face[1] + offsetY, face[2], face[3]);
    processFace(faceImg, face, mode, offsetY);
  }
}

function createFaceDetection() {
  if (!webcam) return;

  // copies webcam image to faceImg and loads its pixels
  faceImg.copy(webcam, 0, 0, webcam.width, webcam.height, 0, 0, cellW, cellH);
  faceImg.loadPixels();

  // draws the image of the frame
  image(faceImg, 0, cellH*4, cellW, cellH);

  // detects and draws faces with the selected effect
  let faces = detectFaces(faceImg);
  drawFaces(faceImg, faces, faceMode, cellH*4);
}

function applyBlur(img) {

  const factor = 8
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

/////////////////////////////////
// VHS EFFECT //
/////////////////////////////////

function vhsEffect(img) {
  let processed = img.get();  // copies image

  chromaticShift(processed);  // chromatic shift (R/B channels)
  scanlinesNoise(processed);  // adds scanlines + white noise

  return processed;
}

function displayVHSEffect() {

  // applies VHS effect to webcam image
  vhsImg = webcam.get();
  vhsImg.resize(cellW, cellH);
  vhsImg = vhsEffect(vhsImg);
  image(vhsImg, cellW*2, 0, cellW, cellH);

  // draws date and time
  drawVHSDate();
}

function drawVHSDate() {

  // draws date and time in the top-right corner of the VHS image
  push();
  textFont(vhsFont);
  textSize(12);
  fill(255);
  stroke(0);
  strokeWeight(1);
  textAlign(RIGHT, TOP);

  // formats date and time as YYYY-MM-DD HH:MM:SS
  let dateStr = nf(year(), 4) + '-' + nf(month(), 2) + '-' + nf(day(), 2) + ' ' + nf(hour(), 2) + ':' + nf(minute(), 2) + ':' + nf(second(), 2);

  // draws the date string with a small margin
  text(dateStr, cellW*3 - 5, 5);
  pop();
}

// Chromatic shift (R/B channels)
function chromaticShift(img) {

  // creates a copy of the image to store shifted values
  let shifted = createImage(img.width, img.height);
  shifted.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
  shifted.loadPixels();
  img.loadPixels();

  // shifts red channel to the right and blue channel to the left
  let shift = 2;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let idx = (y * img.width + x) * 4;                // index of the pixel
      let xR = constrain(x + shift, 0, img.width - 1);  // shifted x for red channel
      let xB = constrain(x - shift, 0, img.width - 1);  // shifted x for blue channel

      shifted.pixels[idx]     = img.pixels[(y * img.width + xR) * 4];     // red
      shifted.pixels[idx + 1] = img.pixels[idx + 1];                      // green
      shifted.pixels[idx + 2] = img.pixels[(y * img.width + xB) * 4 + 2]; // blue
      shifted.pixels[idx + 3] = img.pixels[idx + 3];                      // alpha
    }
  }

  // updates pixels and copies back to original image
  shifted.updatePixels();
  img.copy(shifted, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
}

// Adds scanlines + white noise
function scanlinesNoise(img) {
  img.loadPixels();

  // iterates over each row
  for (let y = 0; y < img.height; y++) {

    // darkens every other line to create scanline effect
    if (y % 2 === 0) {
      // darkens the line by reducing RGB values by 30%
      for (let x = 0; x < img.width; x++) {
        let idx = (y * img.width + x) * 4;
        img.pixels[idx]     *= 0.7;
        img.pixels[idx + 1] *= 0.7;
        img.pixels[idx + 2] *= 0.7;
      }
    }

    // adds white noise randomly on some lines
    if (random() < 0.01) {

      // creates a band of 1 to 3 lines with white noise
      let bandHeight = int(random(1, 3));

      // applies white noise to the band
      for (let by = 0; by < bandHeight; by++) {

        // ensures we don't go out of image bounds
        let yy = constrain(y + by, 0, img.height - 1);

        // applies white noise to the entire line
        for (let x = 0; x < img.width; x++) {
          let idx = (yy * img.width + x) * 4;
          let whiteNoise = random(150, 255);

          // sets R, G, B channels to white noise value
          img.pixels[idx] = img.pixels[idx + 1] = img.pixels[idx + 2] = whiteNoise;
        }
      }
    }
  }
  img.updatePixels();
}