let players = {};
let adjectives;
let videos={
  video1:null,
  video2:null
};

let video;
let canvas;
let dataURL;

let img;
var raw = new Image();

raw.onload = function() {
  img = createImage(raw.width, raw.height);
  img.drawingContext.drawImage(raw, 0, 0);
  //image(img, 0, 0); // draw the image, etc here
}


//zoe
let currentWord;
let halfWidth;
let rollover;
let textX, textY, textW, textH;
let offsetX, offsetY;
let dragging;
let i;
let player1;
let player2;


const ADD_PLAYER = 'add-player';

let image;

function setup() {
  const socket = io('/input');
  // Listen for confirmation of connection
  socket.on('connect', () => initSocket(socket));
  createCanvas(windowWidth, windowHeight);


  //robert
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();
  canvas = document.querySelector('canvas');

  //zoe
  textSize(16);
  noStroke();
  textAlign(CENTER);
  halfWidth = windowWidth / 2;
  halfheight = halfWidth * 0.7;
  textX = halfWidth - 60;
  textY = halfheight + 50;
  textW = 120;
  textH = 30;
  offsetX = 0;
  offsetY = 0;
  dragging = false;
  i = 0;
  background(20);
  currentword = "";
}



function draw() {
  image(video, 0, 0, width, height);
  dataURL = canvas.toDataURL('image/jpeg');

  // background(20);
  //zoe
  if(adjectives) {
    currentword = adjectives[i];

    // rect(10, 10, halfWidth-10, halfheight);
    image(img,10, 10, halfWidth-10, halfheight);
    //rect(halfWidth+10, 10, halfWidth-20, halfheight);
    image(img,halfWidth+10, 10, halfWidth-20, halfheight);
    //word box position
    if (dragging) {
      textX = mouseX + offsetX;
      textY = mouseY + offsetY;
    }else{
      textX = halfWidth-50;
      textY = halfheight+50;
    }
    //word box
    fill(200, 200, 200);
    rect(textX, textY, textW, textH);
    //word
    fill(20,20,20);
    text(currentword, textX+60, textY+20);

    if (mouseX > textX && mouseX < textX + textW && mouseY > textY && mouseY < textY + textH) {
      rollover = true;
    }
    else {
      rollover = false;
    }
  }
}



function initSocket(socket) {
  const name = window.prompt("name?");
  console.log(name);
  socket.emit('init-player', {
    name: name
  });
  socket.on('update-players', (data) => {
    players = data.players;
  });
  socket.on('adjectives', (data) => {
    adjectives = data.adjectives[socket.id];
  });

  setInterval(() => {
    message = {
      id: socket.id,
      data: dataURL
    }
    socket.emit('image', message);

  }, 1000)


  socket.on('image', function(message) {
    // Get id and data from message
    let id = message.id;
    let data = message.data;
    console.log("received", data);
    if(videos.video1==null){
      document.getElementById('video1').src = data;

      // raw.src=data;
      // videos.video1==id;
    }
    else{
      document.getElementById('video2').src = data;
      // raw.src=data;
      // videos.video2==id;
    }

    // // Update user's data
    // if(id in players[]) {
    //   let user = users[id];
    //   user.ppos = user.pos;
    //   user.pos = data;
    // }
    // // Or create a new user
    // else {
    //   users[id] = {
    //     pos: data,
    //     ppos : data
    //   }
    // }
  });
}

function mousePressed() {
  if (rollover) {
    dragging = true;
  }
  if (dragging){
    offsetX = textX-mouseX;
    offsetY = textY-mouseY;
  }

}

function mouseReleased() {
  //if it was dragging
  if (dragging){
    //if over left
    if (mouseX > 10 && mouseX < 10 + (halfWidth-10) && mouseY > 10 && mouseY < 10 + halfheight){
    console.log(player1 + " is " + currentword);
    i ++;

    //if over right
    }else if(mouseX > halfWidth+10 && mouseX < halfWidth+10 + halfWidth-20 && mouseY > 10 && mouseY < 10 + halfheight){
    console.log(player2 + " is " + currentword);
    i ++;
    }
    dragging = false;
  }
}
