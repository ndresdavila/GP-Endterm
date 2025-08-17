let webcam
let snapshot

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

// cell's dimensions
const cellW = 160
const cellH = 120

function setup(){
    createCanvas(640, 480)
    createCanvas(cellW * 3, cellH * 5); // 3 rows and 5 columns
    webcam = createCapture(VIDEO)
    webcam.size(640, 480)
    webcam.hide()

    // sliders
    threshR = createSlider(0,255,128);
    threshR.size(cellW-20, 15);
    threshR.position(0 + 10, cellH*2 + cellH - 20);

    threshG = createSlider(0,255,128);
    threshG.size(cellW-20, 15);
    threshG.position(cellW + 10, cellH*2 + cellH - 20);

    threshB = createSlider(0,255,128);
    threshB.size(cellW-20, 15);
    threshB.position(cellW*2 + 10, cellH*2 + cellH - 20);
}

function draw(){
    background(220)

    // draws grid
    drawGridPlaceholders()

    // show snapshot in row 1 col 1
    if(snapshot) image(snapshot, 0, 0, cellW, cellH)

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

    if(snapshot) image(snapshot, 0, cellH*3, cellW, cellH);
    if(hsvImg)   image(hsvImg, cellW, cellH*3, cellW, cellH); // col 2
    if(labImg)   image(labImg, cellW*2, cellH*3, cellW, cellH); // col 3


    // show live webcam instead
    else {
        image(webcam, 0, 0, cellW, cellH)
        text("Click or press SPACE to take a snapshot", 10, height-20)
    }
  
  if(redImg) applyThresholds()
}

// draws placeholders with their title
function drawGridPlaceholders() {
  textAlign(CENTER, CENTER)
  textSize(10)
  fill(0)
  noFill()
  stroke(150)

  let labels = [
    ["Webcam image", "Grayscale + Brightness +20%", ""],
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
        takeSnapshot();
        createGrayBright();
        createRGBChannels();
        createThresholdImages();
        createHSVImage();
        createLabImage();
      }
}

function takeSnapshot() {
    snapshot = webcam.get()         // captures current image
    snapshot.resize(cellW, cellH)   // resizing to minimum resolution
    snapshot.loadPixels()           // loads pixels
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
  hsvImg = createImage(cellW, cellH);
  hsvImg.loadPixels();

  for (let y = 0; y < cellH; y++) {
    for (let x = 0; x < cellW; x++) {
      let idx = (y * cellW + x) * 4;

      // normalized RGB values (0-1)
      let r = snapshot.pixels[idx] / 255;
      let g = snapshot.pixels[idx + 1] / 255;
      let b = snapshot.pixels[idx + 2] / 255;
      let a = snapshot.pixels[idx + 3];

      // max, min, delta
      let max = Math.max(r, g, b);
      let min = Math.min(r, g, b);
      let delta = max - min;

      // value
      let V = max;

      // saturation
      let S = max === 0 ? 0 : delta / max;

      // R', G', B' (avoid division by zero)
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

      // converts H to degrees (0-360)
      H = (H * 60) % 360;

      // visualization
      hsvImg.pixels[idx]     = H / 360 * 255;
      hsvImg.pixels[idx + 1] = S * 255;
      hsvImg.pixels[idx + 2] = V * 255;
      hsvImg.pixels[idx + 3] = a;
    }
  }
  hsvImg.updatePixels();
}

// ref: https://kaizoudou.com/from-rgb-to-lab-color-space/
function createLabImage() {
  labImg = createImage(cellW, cellH);
  labImg.loadPixels();

  // reference white point for D65 illuminant
  const Xn = 95.047;
  const Yn = 100.000;
  const Zn = 108.883;

  for (let y = 0; y < cellH; y++) {
    for (let x = 0; x < cellW; x++) {
      let idx = (y * cellW + x) * 4;

      // normalized RGB values (0-1)
      let r = snapshot.pixels[idx] / 255;
      let g = snapshot.pixels[idx + 1] / 255;
      let b = snapshot.pixels[idx + 2] / 255;
      let alpha = snapshot.pixels[idx + 3];

      // apply gamma correction
      r = (r > 0.04045) ? pow((r + 0.055)/1.055, 2.4) : r / 12.92;
      g = (g > 0.04045) ? pow((g + 0.055)/1.055, 2.4) : g / 12.92;
      b = (b > 0.04045) ? pow((b + 0.055)/1.055, 2.4) : b / 12.92;

      // convert to XYZ color space
      let X = (r*0.4124 + g*0.3576 + b*0.1805) * 100;
      let Y = (r*0.2126 + g*0.7152 + b*0.0722) * 100;
      let Z = (r*0.0193 + g*0.1192 + b*0.9505) * 100;

      // convert to LAB color space using f(t) function
      function f(t) {
          return t > 0.008856 ? pow(t, 1/3) : (7.787 * t + 16/116);
      }

      let L = (Y / Yn > 0.008856) ? 116 * pow(Y / Yn, 1/3) - 16 : 903.3 * (Y / Yn);
      let aLab = 500 * (f(X / Xn) - f(Y / Yn));
      let bLab = 200 * (f(Y / Yn) - f(Z / Zn));

      // visualization
      labImg.pixels[idx]     = constrain(L / 100 * 255, 0, 255);  // L*
      labImg.pixels[idx + 1] = constrain(aLab + 128, 0, 255);     // a*
      labImg.pixels[idx + 2] = constrain(bLab + 128, 0, 255);     // b*
      labImg.pixels[idx + 3] = alpha;
    }
  }
  labImg.updatePixels();
}