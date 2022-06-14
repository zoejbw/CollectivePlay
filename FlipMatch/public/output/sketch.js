// Open and connect input socket
let socket = io("/output");

// Listen for confirmation of connection
socket.on("connect", function() {
  console.log("Connected");
});

// Keep track of partners
let users = {};

let currentLevel;
// let imgInd;

let time;
let flippedUserNum; // How many users have flipped: 0, 1, 2
let result; // Match result

function init() {
  time = 0;
}

function init_all() {
  init();
  currentLevel = 0;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(20);
  init_all();
  setup_chosenImgs()

  // tilt for adding users and ids
  socket.on("tilt", function(tilt) {
    let id = tilt.id;
    let data = tilt.data;
    
    if (!(id in users) && Object.keys(users).length < 2) {
      createNewUser(tilt, id);
    }
    
    users[id].everStarted = data.everStarted;
    users[id].imgInd = data.imgInd;
  });

  // Listen for message
  socket.on("match", function(match) {
    let id = match.id;
    let data = match.data;

    if (!(id in users) && Object.keys(users).length < 2) {
      createNewUser(tilt, id);
    }
    // Update match status
    users[id].match = data.match;
  });

  // Remove disconnected users
  socket.on("disconnected", function(id) {
    delete users[id];
  });
}

function createNewUser(message, id) {
  users[id] = {
    id: message.id,
    match: "un",
    everStarted: message.data.everStarted,
    currentLevel: message.data.currentLevel,
    imgInd: message.data.imgIng
  };
}

function draw() {
  // background(255);
  // Check match
  if (Object.keys(users).length == 2) {
    // Constantly emit new random ind to inputs
    for (let m = 0; m <= 1; m++) {
      socket.emit('update', {
        targetId: Object.keys(users)[m],
        level: currentLevel,
        ind: random(totalInds[currentLevel][m]),
        otherInd: users[Object.keys(users)[1-m]].imgInd
      });
    }
    
    if (users[Object.keys(users)[0]].everStarted && users[Object.keys(users)[1]].everStarted) {
      // Both of the users started
      if (frameCount % 2 == 0 && users[Object.keys(users)[0]].match == "un") {
        time += 1;
        draw_time([35, 35, 35]);
      } else if (users[Object.keys(users)[0]].match == "match") {
        draw_time([82, 222, 151]);
      } else if (users[Object.keys(users)[0]].match == "wrong") {
        draw_time([250, 150, 150]);
      }
    }
  }
}

function draw_time(color) {
  // clear();
  push();
  fill(255);
  rect(0, 0, width, height);
  fill(color[0], color[1], color[2]);
  textAlign(CENTER, CENTER);
  textFont('Inconsolata', 300);
  text(time / 10, 0, 0, width, height);
  pop();
}
