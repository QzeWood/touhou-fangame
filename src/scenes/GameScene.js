import Phaser from 'phaser';
import { PLAYFIELD, DEPTH } from '../config/constants.js';
import InputManager from '../systems/input/InputManager.js';
import Player from '../entities/player/Player.js';
import { PLAYER_CONFIGS } from '../entities/player/PlayerConfigs.js';
import BulletPool from '../systems/danmaku/BulletPool.js';
import Enemy from '../entities/enemy/Enemy.js';
import { BASIC_ENEMY } from '../data/enemies/stage1_enemies.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.drawPlayfieldBackground();

    const config = PLAYER_CONFIGS.reimu;
    this.physics.world.setBounds(
      PLAYFIELD.x + config.shipRadius,
      PLAYFIELD.y + config.shipRadius,
      PLAYFIELD.width - config.shipRadius * 2,
      PLAYFIELD.height - config.shipRadius * 2,
    );

    this.enemyBulletPool = new BulletPool(this, { size: 300, depth: DEPTH.ENEMY_BULLET });
    this.playerShotPool = new BulletPool(this, { size: 100, depth: DEPTH.PLAYER_BULLET });
    this.enemyGroup = this.add.group();

    this.inputManager = new InputManager(this);
    this.player = new Player(
      this,
      PLAYFIELD.x + PLAYFIELD.width / 2,
      PLAYFIELD.y + PLAYFIELD.height - 80,
      config,
      this.playerShotPool,
    );
    this.player.zone.body.setCollideWorldBounds(true);

    this.enemies = [];
    this.spawnEnemy();

    this.physics.add.overlap(this.player.zone, this.enemyBulletPool.group, (a, b) => {
      const bullet = typeof a.deactivate === 'function' ? a : b;
      bullet.deactivate();
      this.player.flashHit();
    });

    this.physics.add.overlap(this.playerShotPool.group, this.enemyGroup, (a, b) => {
      const shot = typeof a.deactivate === 'function' ? a : b;
      const enemySprite = shot === a ? b : a;
      shot.deactivate();
      const enemy = enemySprite.getData('enemyRef');
      if (enemy) enemy.takeDamage(this.player.config.shot.damage);
    });
  }

  spawnEnemy() {
    const enemy = new Enemy(
      this,
      PLAYFIELD.x + PLAYFIELD.width / 2,
      PLAYFIELD.y + 120,
      BASIC_ENEMY,
      this.enemyBulletPool,
      () => this.time.delayedCall(1500, () => this.spawnEnemy()),
    );
    this.enemies.push(enemy);
    this.enemyGroup.add(enemy.sprite);
  }

  drawPlayfieldBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x0a0a14, 1);
    g.fillRect(PLAYFIELD.x, PLAYFIELD.y, PLAYFIELD.width, PLAYFIELD.height);
    g.lineStyle(2, 0x4444aa, 1);
    g.strokeRect(PLAYFIELD.x, PLAYFIELD.y, PLAYFIELD.width, PLAYFIELD.height);
    g.setDepth(DEPTH.BACKGROUND);
  }

  update(time) {
    this.inputManager.update();
    this.player.update(this.inputManager, time);

    this.enemies = this.enemies.filter((e) => !e.dead);
    this.enemies.forEach((e) => e.update(time));
  }
}
