import Bullet from '../../entities/bullets/Bullet.js';

export default class BulletPool {
  constructor(scene, { size = 200, depth } = {}) {
    this.scene = scene;
    this.group = scene.physics.add.group({ runChildUpdate: true });
    for (let i = 0; i < size; i++) {
      this.group.add(new Bullet(scene, depth));
    }
  }

  fire(x, y, vx, vy, opts) {
    const bullet = this.group.getFirstDead(false);
    if (!bullet) return null;
    bullet.fire(x, y, vx, vy, opts);
    return bullet;
  }
}
