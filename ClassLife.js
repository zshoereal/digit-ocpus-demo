class Life {
  constructor(x, y, speed, walkFrames) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.targetX = x;
    this.targetY = y;

    this.walkFrames = walkFrames;
    this.frameIndex = 0;
    this.animationFrameDuration = walkFrames[0].duration;
    this.ticksLeft = this.animationFrameDuration;
    this.isWalking = false;
    this.facingRight = true;

    // Demo 1：正常情况下追随鼠标，偶尔短暂“走神”。
    this.distractedState = "following";
    this.distractedTicksLeft = 0;
    this.distractedTargetX = x;
    this.distractedTargetY = y;

    // Demo 2：漫游与躲避状态。
    this.introvertedState = "wandering";
    this.wanderTargetX = x;
    this.wanderTargetY = y;
    this.mouseAvoidDistance = 150;
    this.mouseSafeDistance = 190;

    // Demo 3：等待、跟随与回角落状态。
    this.followingState = "waiting";
    this.homeX = x;
    this.homeY = y;
    this.startFollowingDistance = 180;
    this.stopFollowingDistance = 200;
    this.followStopDistance = 45;
  }

  display() {
    const currentFrame = this.walkFrames[this.frameIndex];

    push();
    translate(this.x, this.y);
    scale(this.facingRight ? 1 : -1, 1);
    imageMode(CENTER);
    image(currentFrame.image, 0, 0);
    pop();
  }

  updateAnimation() {
    if (!this.isWalking) {
      this.frameIndex = 0;
      this.ticksLeft = this.animationFrameDuration;
      return;
    }

    this.ticksLeft--;
    if (this.ticksLeft <= 0) {
      this.frameIndex = (this.frameIndex + 1) % this.walkFrames.length;
      this.ticksLeft = this.animationFrameDuration;
    }
  }

  setAnimationFrameDuration(newDuration) {
    if (this.animationFrameDuration !== newDuration) {
      this.animationFrameDuration = newDuration;
      this.ticksLeft = newDuration;
    }
  }

  rest() {
    this.isWalking = false;
  }

  // 朝指定位置移动。stopDistance 用来让角色与目标保留一定距离。
  moveTowards(destinationX, destinationY, moveSpeed, stopDistance = 0) {
    let dx = destinationX - this.x;
    let dy = destinationY - this.y;
    const distance = sqrt(dx * dx + dy * dy);

    if (distance <= stopDistance) {
      this.isWalking = false;
      return true;
    }

    const actualDistance = min(moveSpeed, distance - stopDistance);
    dx /= distance;
    dy /= distance;

    this.x += dx * actualDistance;
    this.y += dy * actualDistance;
    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);
    this.isWalking = true;

    if (dx > 0) this.facingRight = true;
    if (dx < 0) this.facingRight = false;
    return false;
  }

  // Demo 1：大多数时间追随鼠标，偶尔停下或突然走向别处。
  updateDistracted(mousePositionX, mousePositionY) {
    // Demo 1 中 urch 的基础速度为 1，对应较慢的动画节奏。
    this.setAnimationFrameDuration(6);

    if (this.distractedState === "following") {
      // 每帧有 0.4% 的概率走神。
      // 在 40fps 下平均约 6 秒发生一次，但实际时间具有随机感。
      if (random() < 0.004) {
        this.startDistraction();
      }
    } else {
      this.distractedTicksLeft--;

      // 走神时间结束后，无条件恢复追随鼠标。
      if (this.distractedTicksLeft <= 0) {
        this.distractedState = "following";
      }
    }

    if (this.distractedState === "following") {
      // 正常状态：持续追随鼠标。
      this.moveTowards(mousePositionX, mousePositionY, this.speed);
    } else if (this.distractedState === "paused") {
      // 第一种走神：突然停住发呆。
      this.rest();
    } else if (this.distractedState === "wanderingAway") {
      // 第二种走神：暂时无视鼠标，朝随机方向走。
      this.moveTowards(
        this.distractedTargetX,
        this.distractedTargetY,
        this.speed
      );
    }

    this.updateAnimation();
  }

  // 随机决定这次走神是停下，还是走向别处。
  startDistraction() {
    // 一次走神持续 25～70 tick，也就是约 0.6～1.75 秒。
    this.distractedTicksLeft = round(random(25, 71));

    if (random() < 0.5) {
      this.distractedState = "paused";
    } else {
      this.distractedState = "wanderingAway";

      // 在 500 × 500 画布内部随机选一个临时目标。
      // 留出 30 像素边距，避免角色贴住画布边缘。
      const margin = 30;
      this.distractedTargetX = random(margin, width - margin);
      this.distractedTargetY = random(margin, height - margin);
    }
  }

  // Demo 2：平时沿用 urch 的基础速度 1 漫游。
  // 鼠标靠近时，速度 2 是这个模式独有的临时加速行为，
  // 离开逃跑状态后会重新恢复速度 1。
  updateIntroverted(mousePositionX, mousePositionY) {
    const mouseDistance = dist(
      this.x,
      this.y,
      mousePositionX,
      mousePositionY
    );

    if (
      this.introvertedState === "wandering" &&
      mouseDistance < this.mouseAvoidDistance
    ) {
      this.introvertedState = "fleeing";
    } else if (
      this.introvertedState === "fleeing" &&
      mouseDistance > this.mouseSafeDistance
    ) {
      this.introvertedState = "wandering";
      this.chooseWanderTarget();
    }

    if (this.introvertedState === "fleeing") {
      this.setAnimationFrameDuration(3);
      this.fleeFrom(mousePositionX, mousePositionY, 2);
    } else {
      this.setAnimationFrameDuration(6);
      this.wander(1);
    }

    this.updateAnimation();
  }

  wander(wanderSpeed) {
    if (
      dist(this.x, this.y, this.wanderTargetX, this.wanderTargetY) <=
      wanderSpeed
    ) {
      this.chooseWanderTarget();
    }

    this.moveTowards(
      this.wanderTargetX,
      this.wanderTargetY,
      wanderSpeed
    );
  }

  chooseWanderTarget() {
    const margin = 40;
    this.wanderTargetX = random(margin, width - margin);
    this.wanderTargetY = random(margin, height - margin);
  }

  fleeFrom(mousePositionX, mousePositionY, fleeSpeed) {
    let dx = this.x - mousePositionX;
    let dy = this.y - mousePositionY;
    let directionLength = sqrt(dx * dx + dy * dy);

    if (directionLength === 0) {
      const randomAngle = random(TWO_PI);
      dx = cos(randomAngle);
      dy = sin(randomAngle);
      directionLength = 1;
    }

    dx /= directionLength;
    dy /= directionLength;

    const previousX = this.x;
    const previousY = this.y;
    this.x = constrain(this.x + dx * fleeSpeed, 0, width);
    this.y = constrain(this.y + dy * fleeSpeed, 0, height);

    // 正后方是边界时，沿边缘向能离鼠标更远的一侧滑动。
    if (this.x === previousX && this.y === previousY) {
      const sideA = {
        x: constrain(previousX - dy * fleeSpeed, 0, width),
        y: constrain(previousY + dx * fleeSpeed, 0, height)
      };
      const sideB = {
        x: constrain(previousX + dy * fleeSpeed, 0, width),
        y: constrain(previousY - dx * fleeSpeed, 0, height)
      };

      if (
        dist(sideA.x, sideA.y, mousePositionX, mousePositionY) >=
        dist(sideB.x, sideB.y, mousePositionX, mousePositionY)
      ) {
        this.x = sideA.x;
        this.y = sideA.y;
      } else {
        this.x = sideB.x;
        this.y = sideB.y;
      }
    }

    this.isWalking = this.x !== previousX || this.y !== previousY;
    if (dx > 0) this.facingRight = true;
    if (dx < 0) this.facingRight = false;
  }

  // Demo 3：靠近时跟随 ocpus，距离过远后返回最近的角落。
  updateFollowing(ocpus) {
    const distanceToOcpus = dist(this.x, this.y, ocpus.x, ocpus.y);

    if (
      this.followingState === "waiting" &&
      distanceToOcpus < this.startFollowingDistance
    ) {
      this.followingState = "following";
    }

    if (
      this.followingState === "following" &&
      distanceToOcpus > this.stopFollowingDistance
    ) {
      this.chooseNearestCorner();
      this.followingState = "returning";
    }

    this.setAnimationFrameDuration(6);

    if (this.followingState === "waiting") {
      this.rest();
    } else if (this.followingState === "following") {
      this.moveTowards(ocpus.x, ocpus.y, 1, this.followStopDistance);
    } else {
      const arrivedHome = this.moveTowards(this.homeX, this.homeY, 1);
      if (arrivedHome) {
        this.followingState = "waiting";
        this.rest();
      }
    }

    this.updateAnimation();
  }

  chooseNearestCorner() {
    const margin = 60;
    const corners = [
      { x: margin, y: margin },
      { x: width - margin, y: margin },
      { x: margin, y: height - margin },
      { x: width - margin, y: height - margin }
    ];

    let nearestCorner = corners[0];
    let nearestDistance = dist(
      this.x,
      this.y,
      nearestCorner.x,
      nearestCorner.y
    );

    for (let i = 1; i < corners.length; i++) {
      const currentDistance = dist(
        this.x,
        this.y,
        corners[i].x,
        corners[i].y
      );

      if (currentDistance < nearestDistance) {
        nearestCorner = corners[i];
        nearestDistance = currentDistance;
      }
    }

    this.homeX = nearestCorner.x;
    this.homeY = nearestCorner.y;
  }
}
