let webcam
let snapshot
let grayBrightImg   // grayscale image +20% brightness

// channel images
let redImg, greenImg, blueImg

// threshold images
let thrRedImg, thrGreenImg, thrBlueImg

// sliders
let threshR, threshG, threshB

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
    ["Webcam (repeat)", "Colour space 1", "Colour space 2"],
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

// takes snapshot with spacebar
function keyPressed() {
  if (key === ' ') {
    snapshot = webcam.get()         // captures current image
    snapshot.resize(cellW, cellH)   // resizing to minimum resolution
    snapshot.loadPixels()           // loads pixels

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

    // creates red, green and blue channel images
    redImg   = createImage(cellW, cellH)
    greenImg = createImage(cellW, cellH)
    blueImg  = createImage(cellW, cellH)
    redImg.loadPixels(); greenImg.loadPixels(); blueImg.loadPixels();

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

    // create initial threshold images
    thrRedImg = createImage(cellW, cellH)
    thrGreenImg = createImage(cellW, cellH)
    thrBlueImg = createImage(cellW, cellH)
  }
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
