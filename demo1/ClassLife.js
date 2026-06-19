class life {
  //输入所有life的条件//////////////////////////////////////////////////////////////
  constructor(x, y, speed, walkFrame) {
    // constructor (l,m,r,x,y) {
    // this.l = img;//left向左的图片
    // this.m = m;//middle中间态图片
    // this.r = img;//right向右的图片

    this.x = x;//x坐标
    this.y = y;//y坐标
    this.speed = speed;//行走速度

    //目标位置,由于是变量先定义为初始坐标 
    //也就是说如果目标位置不是变量，这边需要重新设定
    this.targetX = x;
    this.targetY = y;

    this.facingRight = true; //判断朝向
    this.isWalking = false; //判断是否还在行走

    this.frameIndex = 0;//显示第几帧 用于控制动画帧
    this.walkFrame = walkFrame;//动画帧序列
    this.ticksLeft = this.walkFrame[0].duration;//这一帧停留多久


    //走走停停功能
    this.state = "walking";//current behaviour state
    this.stateTicksLeft = 80;// how long this state going to last
  }

  //animation working////////////////////////////////////////////////////
  updateAnimation() {
    //when is not walking, character presents as frame0
    if (!this.isWalking) {
      this.frameIndex = 0; //presenting frame0
      this.ticksLeft = this.walkFrame[0].duration;
      return;//立刻结束当前函数，后面的代码不再执行
    }

    // 每执行一次 updateAnimation，剩余 tick 减少 1
    this.ticksLeft--;
    //每帧停留时间结束后，帧数index递加，跳到下一张
    if (this.ticksLeft <= 0) {
      this.frameIndex++;

      //index数大于array长度时归零重新循环
      if (this.frameIndex >= this.walkFrame.length) {
        this.frameIndex = 0;
      }

      // 读取下一帧自己的 duration
      this.ticksLeft =
        this.walkFrame[this.frameIndex].duration;
    }
  }

  //展示图片////////////////////////////////////////////////////////////////
  display() {
    // image(this.m,this.x,this.y);

    const currentImage = this.walkFrame[this.frameIndex]; //不变本地声明 调取当前帧

    push();

    translate(this.x, this.y);//把绘图起点移动到角色的位置

    if (this.facingRight) {
      scale(1, 1);    // 正常方向
    } else {
      scale(-1, 1);   // 水平翻转
    }


    imageMode(CENTER); //设置图片旋转中心
    image(currentImage.image, 0, 0);//虽然这边设置的是0,0，但是实际上它是一直translate到thisx和thisy的 thisxy也在后台不断变化
    //现在currentImage调取的是walkframe array里的element 而element里还有包含image和duration，所以这边还需要image来正常调取图片

    pop();

  }

  //walking function//////////////////////////////////////////////////////////////
  walk() {
    this.isWalking = false;

    //水平移动
    //when the distance between character and targetX is smaller than speed (which means step distance because the character will beyond destination on next frame), next frame the character's x equals targetX. So that the character would not pass destination and vibrate.
    if (abs(this.targetX - this.x) <= this.speed) {
      this.x = this.targetX;
    }
    //如果目标位置在右侧，就向右移动，x坐标增加
    else if (this.x < this.targetX) {
      this.facingRight = true;//checking direction for animation code
      this.x = this.x + this.speed;
      this.isWalking = true;
    }
    //如果目标位置在左侧，就向左移动，x坐标减少
    else if (this.x > this.targetX) {
      this.facingRight = false;
      this.x -= this.speed;
      this.isWalking = true;
    }

    //垂直移动
    if (abs(this.targetY - this.y) <= this.speed) {
      this.y = this.targetY;
    }
    //如果目标位置在下方，就向下移动，y坐标增加
    else if (this.y < this.targetY) {
      this.y = this.y + this.speed;
      this.isWalking = true;
    }
    //如果目标位置在上方，就向上移动，y坐标减少
    else if (this.y > this.targetY) {
      this.y -= this.speed;
      this.isWalking = true;
    }

    //角色不离开屏幕
    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);
  }

  rest() {
    // 这一帧没有移动
    this.isWalking = false;
  }

  //state switching from walking to resting/////////////////////////////////
  //决定什么时候切换状态
  updateState() {
    // 当前状态剩余时间减一
    this.stateTicksLeft--;

    if (this.stateTicksLeft <= 0) {

      if (this.state === "walking") {
        // 从走路切换为休息
        this.state = "resting";
        // this.stateTicksLeft = random(0,200);//the'resting' state last how much time
        this.stateTicksLeft = abs(this.x - this.targetX);//depends on the distance between character and target //the closer the faster
        console.log("resting time", this.stateTicksLeft);
      }
      else if (this.state === "resting") {
        // 从休息切换为走路
        this.state = "walking";
        // this.stateTicksLeft = 80;//the 'walking' state last how much time
        this.stateTicksLeft = 10000 / (abs(this.x - this.targetX) + 1);//depends on the distance between character and target //the closer the longer
        console.log("walking time", this.stateTicksLeft);
      }

      // else if (this.state === "jumping") {
      //   this.state = "resting";
      //   this.stateTicksLeft = 40;
      // }
    }
  }

  //統一的狀態機更新执行////////////////////////////////////////////////////
  update() {
    // 先更新状态和倒计时
    this.updateState();

    // 如果当前状态是 walking，就执行走路
    if (this.state === "walking") {
      this.walk();
    }

    // 如果当前状态是 resting，就执行休息
    if (this.state === "resting") {
      this.rest();
    }

    // 最后更新动画
    this.updateAnimation();
  }

}