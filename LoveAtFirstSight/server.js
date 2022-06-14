const port = process.env.PORT || 8000;
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
//const shuffle = require("./shuffle.js");
const fs = require("fs");

const GAME_STATES = [
  "GAME_WAITING",
  "ROUND_WAITING",
  "ROUND_PLAYING",
  "GAME_END"
];
const ROUNDS = 5;

let round;
let state;
let players;
// {id: {
// name, score, etc...  
// }}
let inputs;
let outputs;
let readyPlayers;
let submitTotal;

function main() {
  app.use(express.static("public"));
  server.listen(port, () => {
    console.log("Server listening at port: ", port);
  });

  inputs = io.of("/input");
  inputs.on("connection", initInputSocket);
  
  outputs = io.of("/output");
  outputs.on("connection", initOutputSocket);
  initGame();
}

function initGame() {
  round = -1;
  state = "GAME_WAITING";
  players = {};
  readyPlayers = 0;
  submitTotal = 0;
}

function initOutputSocket(socket) {
  socket.emit("update_players", { players: players });
}

function initInputSocket(socket) {
  console.log("An input client connected: " + socket.id);
  
  socket.on("player_init", (message) => {
    if (state != "GAME_WAITING") {
      state = "GAME_WAITING";
      initGame();
    }
    // if (state == "GAME_WAITING") {
      players[message.name] = { score: 0, choice: null, name: message.name };

      inputs.emit("update_players", { players: players });
      console.log(players);
    // }
  });
  
  socket.on("player_ready", () => {
    readyPlayers += 1;
    
    if (readyPlayers == Object.keys(players).length) {
      setState("ROUND_PLAYING");    
    }
  });
  
  socket.on("player_submit", (message) => {
    const name = message.myName;
    const choiceName = message.choiceName;
    console.log("player_submit: " + JSON.stringify(message));
    console.log(players);
    submitTotal += 1;
    players[name].choice = choiceName;
    
    // waiting for start when all players have submitted
    if (submitTotal == Object.keys(players).length) {
      console.log(players);
      setState("ROUND_WAITING");
    }
  });

  // this can cause bugs on disconnect-reconnect
  socket.on("disconnect", () => removePlayer(socket));
}

function setState(newState) {
  console.log("SET STATE: " + newState);
  state = newState;
  if (state == "ROUND_PLAYING") {
    readyPlayers = 0;
    round += 1;
    inputs.emit("round_start");
  }
  else if (state == "ROUND_WAITING") {
    submitTotal = 0;
    countScore();
    outputs.emit("update_players", { players: players });
    inputs.emit("round_wait");
  }
}

function countScore() {
  //one choose is one point
  for (let playerId of Object.keys(players)) {
    let choice = players[playerId].choice;
    let chosenPlayer = players[choice];
    chosenPlayer.score += 1;
    
    // one extra point for a pair
    if (chosenPlayer.choice == playerId){
      players[playerId].score += 1;
    }
  }
}

function removePlayer(socket) {
  if (state == "GAME_WAITING") {
    if (socket.id in players) {
      delete players[socket.id];
      console.log("An input client has disconnected: " + socket.id);
      socket.emit("update_players", { players: players });
    }
  }
}
main();
