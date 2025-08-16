let webcam
let snapshot

function setup(){
    createCanvas(640, 480)
    webcam = createCapture(VIDEO)
    webcam.size(640, 480)
    webcam.hide()
}

function draw(){
    background(220)

    // show snapshot if already taken
    if(snapshot){
        image(snapshot, 0, 0)
        text("Snapshot taken. Press 'S' to save", 10, height-20);
    }
    // show live webcam instead
    else {
        image(webcam, 0, 0)
        text("Press SPACE to take a snapshot", 10, height-20)
    }
}

// takes snapshot with spacebar
function keyPressed() {
  if (key === ' ') {
    snapshot = webcam.get();   // captures current image
    snapshot.resize(160, 120)  // resizing to minimum resolution
    snapshot.loadPixels();     // loads pixels
  }
  // stores snapshot with S key
  if ((key === 's' || key === 'S')  && snapshot) {
    save(snapshot, 'snapshot.png');
  }
}

// takes snapshot when clicking as well
function mousePressed() {
    snapshot = webcam.get()
    snapshot.resize(160, 120)  // resizing to minimum resolution
    snapshot.loadPixels()
}