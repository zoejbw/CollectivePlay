let socket = io("/output");

// var person1 = { name: "aefew", score: 3 };
// var person2 = { name: "fewfds", score: 5 };
// var person3 = { name: "jwir", score: 2 };
// var person4 = { name: "kjkjregsg", score: 7 };

let masterArray = [];


function setup() {
  
  noCanvas();
  let myDiv = createP("Leaderboard");
  myDiv.style('text-align:center');
  myDiv.style('color:white');
  myDiv.style('font-size:30px');
  
  socket.on('update_players', (data) => {
    console.log(data);
    masterArray = [];
    document.body.innerHTML = "";
    myDiv = createP("Leaderboard");
    myDiv.style('text-align:center');
    myDiv.style('color:white');
    myDiv.style('font-size:30px');
    for (let playerId in data.players) {
      masterArray.push(data.players[playerId]);
    } 
    updateLeaderboard();
  });
}

function updateLeaderboard() {
  masterArray.sort(function(a, b) {
    return b.score - a.score;
  });
  
  console.log(masterArray);
  
  for(let i = 0; i < masterArray.length; i++) {
    let myDiv = createP(i+1+". "+masterArray[i].name+": "+masterArray[i].score);
    let a = color(6,189,0);
    let b = color(255);
    myDiv.style('background-color',a);
    myDiv.style('color',b);
    myDiv.style('text-align:center');
    myDiv.style('font-size:25px');
    myDiv.style("border-radius", "25px");
  }
}