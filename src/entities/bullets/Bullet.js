import Phaser from 'phaser';

export default class Bullet extends Phaser.GameObjects.Arc {
  constructor(scene, depth) {
    super(scene, -1000, -1000, 4, 0, 360, false, 0xffffff, 1);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(depth);
    this.body.setAllowGravity(false);
    this.setActive(false);
    this.setVisible(false);
  }

  fire(x, y, vx, vy, { radius = 4, color = 0xffffff } = {}) {
    this.setRadius(radius);
    this.fillColor = color;
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body.setCircle(radius);
    this.body.reset(x, y);
    this.body.setVelocity(vx, vy);
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    this.body.setVelocity(0, 0);
    this.setPosition(-1000, -1000);
  }

  update() {
    if (!this.active) return;
    const pad = 60;
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    if (this.x < -pad || this.x > w + pad || this.y < -pad || this.y > h + pad) {
      this.deactivate();
    }
  }
}
