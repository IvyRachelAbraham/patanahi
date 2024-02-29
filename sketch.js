let song = []; // Array named song to load song files
let songFiles = ['Aisha-MEMBA.mp3', 'Glass Animals - Heat Waves.mp3', 'Gulaabo-Sanjith Hegde.mp3']; // Song files
let songDisplayNames = ['Aisha - MEMBA', 'Heat Waves - Glass Animals', 'Gulaabo - Sanjith Hegde']; // Song display names here
let currentHue = 0; // Start with an initial hue value
let hueIndex = 0; // Index to keep track of the current hue option



var amplitude; // variable to get amplitude levels
var prevLevels = new Array(60); // the amplitudes of the last 60 frames to create a moving graph stored in array

let pHtmlMsg;
let serialOptions = { baudRate: 9600 };
let serial;

let state=0;
let latestData = "waiting for data"; // Variable to hold the data 

let currentSong=0;

function preload() {
  // Load each song and add it to the songs array
  for (let i = 0; i < songFiles.length; i++) {
    song[i] = loadSound(songFiles[i]);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  noStroke();

  rectMode(CENTER);
  colorMode(HSB);

  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");

  amplitude = new p5.Amplitude();
  amplitude.setInput(song[currentSong]);
  amplitude.smooth(0.6);
}

function draw() {
  background(20, 20);
  fill(255, 10);

  var level = amplitude.getLevel();


  // rectangle variables
  var spacing = 10; // the black rectangles in between the colored ones
  
  var w = width/ (prevLevels.length * spacing); // the width of the amplitude levels 
  var minHeight = 2;
  var roundness = 20;

  // pushing amplitude into array
  prevLevels.push(level);

  // remove first item in array
  prevLevels.splice(0, 1);

  // loop through all the previous levels
  for (var i = 0; i < prevLevels.length; i++) {

    var x = map(i, prevLevels.length, 0, width/2, width); // Maps the index to the x-coordinate, creating a horizontal distribution
    var h = map(prevLevels[i], 0, 0.5, minHeight, height); // Maps the amplitude level to the rectangle height

    var alphaValue = logMap(i, 0, prevLevels.length, 1, 250); // Maps the index to an alpha value for transparency 

    fill(currentHue, 255, 255, alphaValue); // Sets the fill color with HSB values and alpha

    rect(x, height/2, w, h); // Draws a rectangle on one side of the canvas
    rect(width - x, height/2, w, h); // Draws a mirrored rectangle on the other side of the canvas
  }

  // Display current song name
  fill(255); // White color for text
  textSize(16); // Set text size
  textAlign(CENTER, CENTER); // Center the text horizontally and vertically

  // Display the current song name
  text(songDisplayNames[currentSong], width / 2, height - 700); 

}

/**
 * Callback function by serial.js when there is an error on web serial
 * 
 * @param {} eventSender 
 */
function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

/**
 * Callback function by serial.js when web serial connection is opened
 * 
 * @param {} eventSender 
 */
function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("Serial connection opened successfully");
}

/**
 * Callback function by serial.js when web serial connection is closed
 * 
 * @param {} eventSender 
 */
function onSerialConnectionClosed(eventSender) {
 console.log("onSerialConnectionClosed");
 pHtmlMsg.html("onSerialConnectionClosed");
}

// Add a variable to track the button state
let buttonPressed = false;

function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);

  // Split the received data into distance, button state and state
  let splitData = newData.split(',');
  if (splitData.length == 3) {
    let distance = parseInt(splitData[0]);
    let buttonState = parseInt(splitData[1]);
    let state = parseInt(splitData[2]);

    if (state === 1) {
      // Stop all songs if state is 1
      song.forEach(s => {
        if (s.isPlaying()) {
          s.stop(); // Use stop() to halt playback completely
        }
      });
      return; // Skip further processing
    }
    // Update the buttonPressed state based on buttonState
    if (buttonState == 1) {
      buttonPressed = !buttonPressed; // Toggle the buttonPressed state
      // Control song based on buttonPressed state
      if (buttonPressed) {
        if (song[currentSong].isPlaying()) {
    
          skipToNextSong();
        } else {
          song[currentSong].play();
        }
      }
    }

    // Distance-based control (add an additional condition to check buttonPressed is false)
    if (distance > 0 && distance <= 50 && !buttonPressed) { // Check if the distance is within 50 cm
      if (!song[currentSong].isPlaying()) {
        song[currentSong].play(); // Play the song if it's not already playing
      }
    } else {
      if (song[currentSong].isPlaying() && !buttonPressed) {
        song[currentSong].pause(); // Pause the song if it's playing and no object detected within 50cm
      
      }
    }
  }

}

// This portion was taken from helper.js
function logMap(val, inMin, inMax, outMin, outMax) {
  var offset = 0;
  if (inMax === 0 || inMin === 0) {
    offset = 1;
    inMin += offset;
    inMax += offset;
  }
  var a = (outMin - outMax) / Math.log10(inMin / inMax);
  var b = outMin - a * Math.log10(inMin);
  return a * Math.log10(val + offset) + b;
}


// Function to skip to the next song
function skipToNextSong() {
  // Stop the currently playing song
  if (song[currentSong].isPlaying()) {
    song[currentSong].stop();
  }
  
  // Increment the currentSong index, looping back to 0 if at the end of the array
  currentSong = (currentSong + 1) % song.length;
  
  // Play the next song
  song[currentSong].play();

  currentHue = Math.floor(Math.random() * 360); // Random hue value between 0 and 359

  amplitude.setInput(song[currentSong]);
}

/**
 * Called automatically by the browser through p5.js when mouse clicked
 */
function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}

