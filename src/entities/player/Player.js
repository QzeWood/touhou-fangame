import { DEPTH } from '../../config/constants.js';

export default class Player {
  constructor(scene, x, y, config, shotPool) {
    this.scene = scene;
    this.config = config;
    this.shotPool = shotPool;
    this.isFocused = false;
    this.lastShotAt = 0;

    const hbSize = config.hitboxRadius * 2;
    this.zone = scene.add.zone(x, y, hbSize, hbSize);
    scene.physics.add.existing(this.zone);
    this.zone.body.setCircle(config.hitboxRadius);
    this.zone.body.setAllowGravity(false);

    this.visual = scene.add.graphics();
    this.visual.setDepth(DEPTH.PLAYER);
    this.drawShip();

    this.hitboxDot = scene.add.graphics();
    this.hitboxDot.setDepth(DEPTH.PLAYER_HITBOX);
    this.hitboxDot.fillStyle(0xffffff, 1);
    this.hitboxDot.fillCircle(0, 0, config.hitboxRadius);
    this.hitboxDot.lineStyle(1, 0xff4444, 1);
    this.hitboxDot.strokeCircle(0, 0, config.hitboxRadius + 2);
    this.hitboxDot.setVisible(false);

    this.syncVisualPosition();
  }

  drawShip() {
    const g = this.visual;
    const r = this.config.shipRadius;
    g.clear();
    g.fillStyle(this.config.color, 1);
    g.fillTriangle(0, -r, -r * 0.7, r * 0.8, r * 0.7, r * 0.8);
    g.fillStyle(this.config.accentColor, 1);
    g.fillCircle(0, 0, r * 0.25);
  }

  get x() {
    return this.zone.x;
  }

  get y() {
    return this.zone.y;
  }

  syncVisualPosition() {
    this.visual.setPosition(this.zone.x, this.zone.y);
    this.hitboxDot.setPosition(this.zone.x, this.zone.y);
  }

  update(input, time) {
    const speed = input.focus ? this.config.speedFocus : this.config.speedNormal;
    let vx = 0;
    let vy = 0;
    if (input.left) vx -= 1;
    if (input.right) vx += 1;
    if (input.up) vy -= 1;
    if (input.down) vy += 1;
    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }
    this.zone.body.setVelocity(vx * speed, vy * speed);

    this.isFocused = input.focus;
    this.hitboxDot.setVisible(this.isFocused);

    if (input.shoot && time - this.lastShotAt >= this.config.shot.cooldownMs) {
      this.fire(time);
    }

    this.syncVisualPosition();
  }

  fire(time) {
    this.lastShotAt = time;
    const shot = this.config.shot;
    for (const b of shot.bullets) {
      this.shotPool.fire(
        this.x + (b.offsetX || 0),
        this.y - this.config.shipRadius,
        0,
        -(b.speed || shot.speed),
        { radius: shot.radius, color: shot.color },
      );
    }
  }

  flashHit() {
    this.scene.tweens.add({
      targets: this.visual,
      alpha: { from: 0.2, to: 1 },
      duration: 80,
      repeat: 3,
    });
  }
}
