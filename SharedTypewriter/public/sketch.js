// Open and connect socket
let socket = io();
let fromLeft = 0;
let fromTop = 0;

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

function setup(){
  createCanvas(windowWidth, windowHeight);
  background(255);

  // Receive message from server
  socket.on('data', writeKey);
}

function keyTyped(){
  socket.emit('data', { myKey: key });
}

//writes letter to screen
function writeKey(data) {
 textSize(25);
 textFont("courier");
 text(data.myKey, 10+fromLeft, 30+fromTop);
 
 //indents between letters
 fromLeft += 20;

 //indents between lines
 if(fromLeft > (windowWidth-30)){
   fromLeft = 0;
   fromTop += 30;
 }
}
