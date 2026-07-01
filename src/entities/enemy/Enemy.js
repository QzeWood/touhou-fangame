import { DEPTH } from '../../config/constants.js';

export default class Enemy {
  constructor(scene, x, y, config, bulletPool, onDeath) {
    this.scene = scene;
    this.config = config;
    this.bulletPool = bulletPool;
    this.onDeath = onDeath;
    this.hp = config.hp;
    this.lastFiredAt = 0;
    this.dead = false;

    this.sprite = scene.add.circle(x, y, config.radius, config.color);
    this.sprite.setDepth(DEPTH.ENEMY);
    scene.physics.add.existing(this.sprite);
    this.sprite.body.setCircle(config.radius);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setImmovable(true);
    this.sprite.setData('enemyRef', this);
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  takeDamage(amount) {
    if (this.dead) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.destroy();
    }
  }

  destroy() {
    this.dead = true;
    this.sprite.destroy();
    if (this.onDeath) this.onDeath();
  }

  update(time) {
    if (this.dead) return;
    if (time - this.lastFiredAt >= this.config.fireIntervalMs) {
      this.lastFiredAt = time;
      this.fireRadialBurst();
    }
  }

  fireRadialBurst() {
    const { bulletCount, bulletSpeed, bulletRadius, bulletColor } = this.config.attack;
    for (let i = 0; i < bulletCount; i++) {
      const angle = (i / bulletCount) * Math.PI * 2;
      const vx = Math.cos(angle) * bulletSpeed;
      const vy = Math.sin(angle) * bulletSpeed;
      this.bulletPool.fire(this.x, this.y, vx, vy, { radius: bulletRadius, color: bulletColor });
    }
  }
}
