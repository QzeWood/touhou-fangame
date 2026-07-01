import { DEPTH } from '../../config/constants.js';
import SpellCardController from '../../systems/spellcard/SpellCardController.js';

export default class Boss {
  constructor(scene, x, y, config, bulletPool, targetProvider, callbacks = {}) {
    this.scene = scene;
    this.config = config;
    this.bulletPool = bulletPool;
    this.targetProvider = targetProvider;
    this.dead = false;

    this.maxHp = config.cards.reduce((sum, c) => sum + c.hp, 0);
    this.hp = this.maxHp;

    this.sprite = scene.add.circle(x, y, config.radius, config.color);
    this.sprite.setDepth(DEPTH.ENEMY);
    scene.physics.add.existing(this.sprite);
    this.sprite.body.setCircle(config.radius);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setImmovable(true);
    this.sprite.setData('enemyRef', this);

    this.onDefeatedCb = callbacks.onDefeated;

    this.controller = new SpellCardController(scene, this, config.cards, {
      onCardStart: callbacks.onCardStart,
      onCardEnd: callbacks.onCardEnd,
      onAllCardsDone: () => this.onAllCardsDone(),
    });
    this.controller.start();
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  takeDamage(amount) {
    if (this.dead) return;
    this.hp = Math.max(0, this.hp - amount);
    this.controller.notifyDamage(amount);
  }

  notifyPlayerHit() {
    this.controller.notifyPlayerHit();
  }

  clearBullets() {
    this.bulletPool.group.getChildren().forEach((b) => {
      if (b.active) b.deactivate();
    });
  }

  onAllCardsDone() {
    this.dead = true;
    this.clearBullets();
    this.sprite.destroy();
    if (this.onDefeatedCb) this.onDefeatedCb(this);
  }
}
