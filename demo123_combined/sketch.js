let ocpus;
let urch;
let ocpusWalkFrames;
let urchWalkFrames;
let currentMode = "demo0";

// 鼠标和触摸共用这一组互动坐标。
// 角色逻辑只读取 interactionX / interactionY，因此不需要分别写手机版行为。
let interactionX;
let interactionY;

function preload() {
  ocpusWalkFrames = [
    { image: loadImage("img/ocpus_m.png"), duration: 6 },
    { image: loadImage("img/ocpus_r.png"), duration: 6 },
    { image: loadImage("img/ocpus_m.png"), duration: 6 },
    { image: loadImage("img/ocpus_l.png"), duration: 6 }
  ];

  urchWalkFrames = [
    { image: loadImage("img/urch_m.png"), duration: 6 },
    { image: loadImage("img/urch_r.png"), duration: 6 },
    { image: loadImage("img/urch_m.png"), duration: 6 },
    { image: loadImage("img/urch_l.png"), duration: 6 }
  ];
}

function setup() {
  // 桌面端画布最大为 500 × 500；屏幕较小时会自动缩小。
  const canvasSize = calculateCanvasSize();
  const canvas = createCanvas(canvasSize, canvasSize);
  canvas.addClass("experience-canvas");
  canvas.parent("canvas-container");
  frameRate(40);

  // 初始互动点位于画布中心。用户尚未移动鼠标或触摸时，
  // 两个角色会先朝画面中心移动。
  interactionX = width / 2;
  interactionY = height / 2;

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => switchMode(button.dataset.mode));
  });

  // 页面打开时默认显示没有特殊事件的对照组。
  switchMode("demo0");
}

function switchMode(newMode) {
  currentMode = newMode;

  // 所有模式统一使用同一组“基础速度”，方便公平比较：
  // ocpus 每帧移动 2 像素，urch 每帧移动 1 像素。
  // 若以后想整体改变角色速度，只需要修改下面两个数字。
  const ocpusBaseSpeed = 2;
  const urchBaseSpeed = 1;

  // 每次切换都重新创建角色，防止上一模式的走神、逃跑或跟随状态
  // 被带入下一个模式。
  ocpus = new Life(
    random(width),
    random(height),
    ocpusBaseSpeed,
    ocpusWalkFrames
  );
  urch = new Life(60, 60, urchBaseSpeed, urchWalkFrames);

  if (newMode === "demo2") {
    // Demo 2 开始时先给 urch 选择一个随机漫游目标。
    urch.chooseWanderTarget();
  }

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === newMode);
  });
}

function draw() {
  background(220);

  // 四个模式中 ocpus 都只负责追随鼠标，基础速度始终为 2。
  // 速度较快，因此每张动画帧只停留 3 tick。
  ocpus.setAnimationFrameDuration(3);
  ocpus.moveTowards(interactionX, interactionY, ocpus.speed);
  ocpus.updateAnimation();
  ocpus.display();

  if (currentMode === "demo0") {
    // 对照组：urch 也只追随鼠标，没有走神、躲避或跟随 ocpus。
    // urch 的基础速度为 1，动作较慢，所以动画帧停留 6 tick。
    urch.setAnimationFrameDuration(6);
    urch.moveTowards(interactionX, interactionY, urch.speed);
    urch.updateAnimation();
  } else if (currentMode === "demo1") {
    urch.updateDistracted(interactionX, interactionY);
  } else if (currentMode === "demo2") {
    urch.updateIntroverted(interactionX, interactionY);
  } else {
    urch.updateFollowing(ocpus);
  }

  urch.display();
}

// 根据浏览器可用空间计算正方形画布尺寸。
// 24 是移动端左右安全边距。高度不再参与计算，因为问卷区域允许页面滚动。
function calculateCanvasSize() {
  return max(180, min(500, windowWidth - 24));
}

// 桌面端：鼠标在画布中移动或拖动时更新互动位置。
function mouseMoved() {
  updateInteractionPosition(mouseX, mouseY);
}

function mouseDragged() {
  updateInteractionPosition(mouseX, mouseY);
  return false;
}

function mousePressed() {
  updateInteractionPosition(mouseX, mouseY);
}

// 移动端：使用第一根手指在画布中的位置。
// 返回 false 会阻止浏览器把拖动解释成页面滚动或下拉刷新。
function touchStarted() {
  if (touches.length > 0) {
    updateInteractionPosition(touches[0].x, touches[0].y);
  }
  return false;
}

function touchMoved() {
  if (touches.length > 0) {
    updateInteractionPosition(touches[0].x, touches[0].y);
  }
  return false;
}

function touchEnded() {
  // 不重置坐标：手指离开后，最后一次触摸位置继续作为互动目标。
  return false;
}

// 只接受画布范围内的位置，避免触摸按钮时改变角色目标。
function updateInteractionPosition(newX, newY) {
  if (newX >= 0 && newX <= width && newY >= 0 && newY <= height) {
    interactionX = newX;
    interactionY = newY;
  }
}

function windowResized() {
  const previousWidth = width;
  const previousHeight = height;
  const canvasSize = calculateCanvasSize();

  resizeCanvas(canvasSize, canvasSize);

  // 按画布缩放比例保留角色和互动点的大致相对位置。
  const scaleX = width / previousWidth;
  const scaleY = height / previousHeight;
  ocpus.x *= scaleX;
  ocpus.y *= scaleY;
  urch.x *= scaleX;
  urch.y *= scaleY;
  interactionX *= scaleX;
  interactionY *= scaleY;

  // 同步限制各模式保存的临时目标，防止旋转屏幕后目标落在画布外。
  urch.wanderTargetX = constrain(urch.wanderTargetX * scaleX, 0, width);
  urch.wanderTargetY = constrain(urch.wanderTargetY * scaleY, 0, height);
  urch.distractedTargetX = constrain(
    urch.distractedTargetX * scaleX,
    0,
    width
  );
  urch.distractedTargetY = constrain(
    urch.distractedTargetY * scaleY,
    0,
    height
  );
  urch.homeX = constrain(urch.homeX * scaleX, 0, width);
  urch.homeY = constrain(urch.homeY * scaleY, 0, height);
}

function keyPressed() {
  if (key === "s") {
    saveGif("GIF", 5);
  }
}
