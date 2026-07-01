import { DEPTH } from '../../config/constants.js';
import PatternRunner from '../../systems/danmaku/PatternRunner.js';

export default class Enemy {
  constructor(scene, x, y, config, bulletPool, targetProvider, onDeath) {
    this.scene = scene;
    this.config = config;
    this.onDeath = onDeath;
    this.hp = config.hp;
    this.dead = false;

    this.sprite = scene.add.circle(x, y, config.radius, config.color);
    this.sprite.setDepth(DEPTH.ENEMY);
    scene.physics.add.existing(this.sprite);
    this.sprite.body.setCircle(config.radius);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setImmovable(true);
    this.sprite.setData('enemyRef', this);

    this.patternRunner = new PatternRunner(scene, bulletPool);
    this.patternRunner.run(config.pattern, () => ({ x: this.x, y: this.y }), targetProvider);
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
    if (this.hp <= 0) this.destroy();
  }

  destroy() {
    this.dead = true;
    this.patternRunner.stop();
    this.sprite.destroy();
    if (this.onDeath) this.onDeath(this);
  }
}
