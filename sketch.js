let webcam
let snapshot

// cell's dimensions
const cellW = 160
const cellH = 120

function setup(){
    createCanvas(640, 480)
    createCanvas(cellW * 3, cellH * 5); // 3 rows and 5 columns
    webcam = createCapture(VIDEO)
    webcam.size(640, 480)
    webcam.hide()
}

function draw(){
    background(220)

    // draws grid
    drawGridPlaceholders()

    // show snapshot if already taken
    if(snapshot){
        image(snapshot, 0, 0, cellW, cellH) // row 1, column 1
    }
    // show live webcam instead
    else {
        image(webcam, 0, 0, cellW, cellH)
        text("Click or press SPACE to take a snapshot", 10, height-20)
    }
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
    snapshot = webcam.get()        // captures current image
    snapshot.resize(cellW, cellH)   // resizing to minimum resolution
    snapshot.loadPixels()          // loads pixels
  }
}

// takes snapshot when clicking as well
function mousePressed() {
    snapshot = webcam.get()
    snapshot.resize(160, 120)  // resizing to minimum resolution
    snapshot.loadPixels()
}