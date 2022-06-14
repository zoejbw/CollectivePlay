// Close, See, Show

// Open and connect input socket
let socket = io("/input");

let users = {};

let flipY;
let pFlipY = 180; /*a random number >90 or <-90*/ // pFlipY is used to track if the phone is flipped closed or open
let flipToShow; // true if the phone is flipped to show

let currentLevel = null;
let imgInd = null;

let imgUpdated = false; // The img will only change for one time when the phone is faced the table

let status = 'start'; // 'show' 'see' 'close' / 'start'
let everStarted = false; // Set to false everytime start a new level
let shown = false;

let match = "un"; // 'un', 'match', 'wrong'
let bgColorKit;
let bgColor;

// Listen for confirmation of connection
socket.on("connect", function() {
  console.log("Connected");
});

function init() {
  status = 'start'; // initial status
  flipToShow = false;
  everStarted = false;
  shown = false;
  match = 'un';
  bgColor = bgColorKit[0];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(20);
  bgColorKit = [color(255, 255, 255), color(82, 222, 151), color(250, 150, 150)];
  init();

  // Always check if the other player has flipped
  socket.on("tilt", function(tilt) {
    let id = tilt.id;
    let data = tilt.data;

    if (!(id in users) && Object.keys(users).length < 2) {
      createNewUser(tilt, id);
    }
    
    let user = users[id];
    user.status = data.status;

  });

  // Update the emoji image based on level num and ind num
  // "update" emitted from output
  socket.on("update", function(update) {
    // Flipped close, the img will be updated the moment the screen touch the table
    if (status == 'close' && !imgUpdated && socket.id == update.data.targetId) {
      if (Object.keys(users).length == 2) {
        let hasFlipped; // true if anyone show
        if (users[Object.keys(users)[0]].status == 'show' || users[Object.keys(users)[1]].status == 'show') {
          hasFlipped = true;
        } else {
          hasFlipped = false;
        }
        
        // Only update when none of the users flipped
        if (!hasFlipped) {
          let data = update.data;
          // if (!(data.targetId in users) && Object.keys(users).length < 2) {
          //   createNewUser(update, data.targetId);
          // }
          
          // Only update the user self
          let user = users[data.targetId];
          user.level = data.level;
          user.ind = data.ind;
          let otherUser = users[Object.keys(users)[1 - Object.keys(users).indexOf(data.targetId)]];
          otherUser.level = data.level;
          otherUser.ind = data.otherInd;
          
          imgUpdated = true;
        }
      }
    }
  });
}

function createNewUser(data, id) {
  users[id] = {
    id: data.id,
    status: 'start',
    level: 0,
    ind: 0
  };
}

function draw() {
  background(bgColor);

  calculate_flipY(); // Update the latest flipY and flipToShow
  
  if (!everStarted && flipY != 0 && flipToShow) {
    // everStarted after first time see
    everStarted = true;
  }
  
  if (everStarted && flipY === 0 && flipToShow) {
    status = 'show';
  } else if (flipY != 0) {
    status = 'see';
  } else if (flipY === 0 && !flipToShow) {
    status = 'close';
  }
  
  emit_tilt(); // Always send if the user if flipped or not
  
  if (everStarted && !shown) {
    // Update imgUpdated when *see*
    if (status == 'see' && imgUpdated) {
      imgUpdated = false;
    }

    // Match happens here in draw()
    if (Object.keys(users).length == 2) {
      let bothFlipped;
      if (users[Object.keys(users)[0]].status == 'show' && users[Object.keys(users)[1]].status == 'show') {
        bothFlipped = true;
        shown = true;
      } else {
        bothFlipped = false;
      }

      if (bothFlipped) {
        if (users[Object.keys(users)[0]].ind == users[Object.keys(users)[1]].ind) {
          match = 'match';
          bgColor = bgColorKit[1]; // Green
        } else {
          match = 'wrong';
          bgColor = bgColorKit[2]; // Red
        }
      } else {
        match = 'un';
        bgColor = bgColorKit[0]; // White
      }

      // Emit to output
      // Emit only when two users connected
      socket.emit('match', {
        match: match
      });
    }

    // Set currentLevel and imgInd
    for (let u in users) {
      if (users[u].id === socket.id) {
        currentLevel = users[u].level;
        imgInd = users[u].ind;
      }
    }
  }
  
  if ((status == 'see' || status == 'show') && (everStarted || shown)) {
      draw_emoji(currentLevel, imgInd);
  }

}

function emit_tilt() {
  socket.emit("tilt", {
    status: status,
    everStarted: everStarted,
    imgInd: imgInd
  });
}