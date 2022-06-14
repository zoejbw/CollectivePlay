// --------------------------------------------------
// Set array for level 1
var level_1 = {
  img: ["1f607", "1f606", "1f608", "1f609", "1f610"],
  imgNum: 3 // The total number of images the user will random from
};

var level_2 = {
  img: [],
  imgNum: 3
};

var level_3 = {
  img: [],
  imgNum: 4
};

var levels = [level_1];

// --------------------------------------------------

var sameInds;
var totalInds; // [[[1, 2, 5], [1, 3, 4]], [...], [...]]

function setup_chosenImgs() {
  sameInds = [];
  for (let i = 0; i < levels.length; i++) {
    sameInds.push(levels[i].img.indexOf(random(levels[i].img)));
  }
  console.log(sameInds);
  totalInds = [];
  for (let i = 0; i < levels.length; i++) { // i is level num
    let tempLevel = [[sameInds[i]], [sameInds[i]]];
    for (let m = 0; m <= 1; m++) { // m is player num
      for (let j = 1; j < levels[i].imgNum; j++) {
        let tempAdd = levels[i].img.indexOf(random(levels[i].img));
        while (tempLevel[0].includes(tempAdd) || tempLevel[1].includes(tempAdd)) {
          tempAdd = levels[i].img.indexOf(random(levels[i].img));
        }
        tempLevel[m].push(tempAdd);
      }
    }
    totalInds.push(tempLevel);
  }
}

function draw_emoji(level, index) {
  var emojiWidth = width / 2;
  
  let i = levels[level].img;
  i = i[index]; // "1f607"
  
  // push();
  // textSize(200);
  // text(i, 100, 400);
  // pop();
  
  push();
  imageMode(CENTER);
  
  imgOnCanvas = createImg('https://twemoji.maxcdn.com/v/latest/72x72/' + i + '.png', i);
  
  // Draw on the canvas
  translate(width / 2, height / 2);
  rotate(- PI / 2);
  image(imgOnCanvas, 0, 0, emojiWidth, emojiWidth);
  imgOnCanvas.hide();
  pop();
}