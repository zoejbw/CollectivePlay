let socket = io("/input");

socket.on("connect", function() {
  console.log("Connected");
});

let players = {};

let states = ["go", "count", "choose", "name"];
// go = 0, count = 1, choose = 2, name = 3
let state, input, button, nameButton, submitButton;
let initialTimer = 10;
let timer = initialTimer;
let buttons = [];
let myChoice = "none";
let buttonHeight
let myName, myRed, myGreen;
let ready;

function setup() {
  createCanvas(windowWidth, windowHeight);
  myRed = color(209, 0, 0);
  myGreen = color(6, 189, 0);
  changeState(3);
  ready = false;

  socket.on("update_players", (data) => {
    players = data.players;
    console.log(players);
  });
  
  socket.on("round_start", () => {
    changeState(1);
  });
}

function draw() {
  if (frameCount % 60 == 0 && timer > 0 && state == 1) {
    timer--;
    countScreen();
  }
  if (timer == 0) {
    changeState(2);
    timer = initialTimer;
  }
}

function changeState(myState) {
  console.log("CHANGE STATE: " + myState + ", " + states[myState]);
  state = myState;
  if (myState == 3) {
    nameScreen();
  } else if (myState == 0) {
    goScreen();
  } else if (myState == 1) {
    countScreen();
  } else if (myState == 2) {
    chooseScreen();
  }
}

function sendReady() {
  //SEND "ready"
  socket.emit('player_ready');
}

function nameScreen() {
  background(50);

  input = createInput();
  input.position(20, 65);

  nameButton = createButton("submit");
  nameButton.position(20, 95);
  nameButton.mousePressed(setName);
  nameButton.style("background-color", myRed);
  nameButton.style("width", "130px");
  nameButton.style("height", "45px");
  nameButton.style("color", "white");
  nameButton.style("font-size", "20px");
  nameButton.style("border", "none");
  nameButton.style("border-radius", "25px");
}

function setName() {
  myName = input.value();
  console.log(myName);
  //SEND NAME
  let message = {
    name: myName
  };
  socket.emit("player_init", message);
  input.style("display", "none");
  nameButton.style("display", "none");
  changeState(0);
}

function goScreen() {
  background(50);

  if(ready) {
    waitButton = createButton("waiting");
    waitButton.position((windowWidth/2-100), 30);
    waitButton.mousePressed();
    waitButton.style("background-color", "white");
    waitButton.style("width", "200px");
    waitButton.style("height", "200px");
    waitButton.style("color", myGreen);
    waitButton.style("font-size", "20px");
    waitButton.style("border", "none");
    waitButton.style("border-radius", "250px");
  }
  else {
    goButton = createButton("ready");
    goButton.position((windowWidth/2-100), 30);
    goButton.mousePressed(() => {
      ready = true;
      goScreen();
    });
    goButton.style("background-color", myGreen);
    goButton.style("width", "200px");
    goButton.style("height", "200px");
    goButton.style("color", "white");
    goButton.style("font-size", "20px");
    goButton.style("border", "none");
    goButton.style("border-radius", "250px");
  }
}

function countScreen() {
  background(50);
  fill(myRed);
  noStroke();
  ellipse(windowWidth / 2, 150, 200, 200);
  fill(250);
  textSize(50);
  text(timer, windowWidth / 2 - 10, 160);
  ready = false;
}

function chooseScreen() {
  buttonHeight = 50;
  for (let name in players) {
    if (name == myName) {
      continue;
    }
    let player = players[name];
    button = createButton(player.name, name);
    button.position(20, buttonHeight);
    button.mousePressed(() => choice(name));
    buttonHeight = buttonHeight + 50;
    button.class(name);
    button.style("background-color", myGreen);
    button.style("width", "85%");
    button.style("height", "45px");
    button.style("font-size", "20px");
    button.style("color", "white");
    button.style("border", "none");
    button.style("border-radius", "25px");

    buttons.push(button);
  }

  submitButton = createButton("Submit", myChoice);
  submitButton.position(20, buttonHeight + 20);
  submitButton.mousePressed(() => sendChoice(myChoice));
  submitButton.style("background-color", myRed);
  submitButton.style("width", "85%");
  submitButton.style("height", "45px");
  submitButton.style("color", "white");
  submitButton.style("font-size", "20px");
  submitButton.style("border", "none");
  submitButton.style("border-radius", "25px");
  background(50);
}

function choice(chose) {
  myChoice = chose;

  for (let button of buttons) {
    button.removeClass("chosen");
    if (button.class() == chose) {
      console.log("clicked: " + button.class());
      button.addClass("chosen");
    }
  }
}

function sendChoice(chose) {
  // SEND SERVER CHOICE
  console.log("submitted: " + chose);
  let message = {
    choiceName: chose, myName: myName 
  };
  console.log(message);
  socket.emit("player_submit", message);
  changeState(0);
  
  for (button of buttons) {
    button.style("display", "none");
  }
  submitButton.style("display", "none");
}
