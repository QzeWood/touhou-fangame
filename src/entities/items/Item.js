import Phaser from 'phaser';
import { DEPTH } from '../../config/constants.js';

export default class Item {
  constructor(scene, x, y, type, config) {
    this.scene = scene;
    this.type = type;
    this.config = config;
    this.collected = false;

    this.sprite = scene.add.circle(x, y, config.radius, config.color);
    this.sprite.setDepth(DEPTH.ITEM);
    scene.physics.add.existing(this.sprite);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setVelocity(Phaser.Math.Between(-30, 30), -140);
    this.sprite.body.setGravityY(240);
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  destroy() {
    this.sprite.destroy();
  }
}
