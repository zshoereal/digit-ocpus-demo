// let ocpusM;
// let ocpusL;
// let ocpusR;
let ocpus1;
let urch1;
// let urchM;

let walkFrame = [] //动画帧array
let ocpusWalkFrame = [];//reach character has their own array
let urchWalkFrame = [];


function preload() {
  // ocpusM = loadImage('img/ocpus_m.png');
  // ocpusL = loadImage('img/ocpus_l.png');
  // ocpusR = loadImage('img/ocpus_r.png');
  // urchM = loadImage('img/urch_m.png');

  //将走路动画按帧排列进array
  // walkFrame[0] = loadImage('img/ocpus_m.png');
  // walkFrame[1] = loadImage('img/ocpus_r.png');
  // walkFrame[2] = loadImage('img/ocpus_m.png');
  // walkFrame[3] = loadImage('img/ocpus_l.png');

  //setting array with walking animation frame, and making each element containing image and duration time
  //image是动画帧 duration是每帧动画时长 速度越快的角色动作越快 duration就可以相应减短
  ocpusWalkFrame = [
    {
      image: loadImage('img/ocpus_m.png'),
      duration: 6
    },
    {
      image: loadImage('img/ocpus_r.png'),
      duration: 6
    },
    {
      image: loadImage('img/ocpus_m.png'),
      duration: 6
    },
    {
      image: loadImage('img/ocpus_l.png'),
      duration: 6
    }
  ]

  urchWalkFrame = [
    {
      image: loadImage('img/urch_m.png'),
      duration: 3
    },
    {
      image: loadImage('img/urch_r.png'),
      duration: 3
    },
    {
      image: loadImage('img/urch_m.png'),
      duration: 3
    },
    {
      image: loadImage('img/urch_l.png'),
      duration: 3
    }
  ]
}

function setup() {
  createCanvas(windowWidth, windowHeight);//全屏
  frameRate(40); //限制刷新率
  //创生角色
  ocpus1 = new life(random(width), random(height), 1, ocpusWalkFrame);
  urch1 = new life(100, 100, 2, urchWalkFrame);
}




function draw() {
  background(220);
  // image(ocpus1, 0, 0);
  // op.display();
  // op.update();
  ocpus1.targetX = mouseX;//实时目标位置
  ocpus1.targetY = mouseY;
  urch1.targetX = mouseX;
  urch1.targetY = mouseY;

  
  //先计算移动，再更新动画
  // ocpus1.walk();
  // ocpus1.updateAnimation();
  ocpus1.update();
  ocpus1.display();

  urch1.walk();
  urch1.updateAnimation();
  urch1.display();
  // console.log(mouseX);
}

function keyPressed() {
  if (key === 's') {
    saveGif('GIF', 5);
  }
}
