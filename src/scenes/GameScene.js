import Phaser from 'phaser';
import { PLAYFIELD, DEPTH } from '../config/constants.js';
import InputManager from '../systems/input/InputManager.js';
import Player from '../entities/player/Player.js';
import { PLAYER_CONFIGS } from '../entities/player/PlayerConfigs.js';
import BulletPool from '../systems/danmaku/BulletPool.js';
import Enemy from '../entities/enemy/Enemy.js';
import Boss from '../entities/enemy/Boss.js';
import { BASIC_ENEMY, AIMED_ENEMY } from '../data/enemies/stage1_enemies.js';
import { STAGE1 } from '../data/stages/stage1.js';
import { STAGE1_BOSS } from '../systems/spellcard/SpellCardDefinitions/stage1_boss.js';
import ScoreManager from '../systems/score/ScoreManager.js';
import { ITEM_TYPES, rollDrops } from '../systems/score/ItemDropTable.js';
import Item from '../entities/items/Item.js';
import HUD from '../ui/HUD.js';
import TitleCardBanner from '../ui/TitleCardBanner.js';

const ENEMY_TYPES = { basic: BASIC_ENEMY, aimed: AIMED_ENEMY };

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

    this.scoreManager = new ScoreManager();
    this.enemyBulletPool = new BulletPool(this, { size: 400, depth: DEPTH.ENEMY_BULLET });
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
    this.items = [];
    this.boss = null;
    this.lastBombPressedAt = -Infinity;
    this.gameEnded = false;

    this.hud = new HUD(this, this.scoreManager);
    this.banner = new TitleCardBanner(this);
    this.messageText = this.add
      .text(PLAYFIELD.width / 2, PLAYFIELD.height / 2, '', {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(200)
      .setVisible(false);

    this.restartKey = this.input.keyboard.addKey('R');

    this.setupOverlaps();
    this.scheduleStage();
  }

  setupOverlaps() {
    this.physics.add.overlap(this.player.zone, this.enemyBulletPool.group, (a, b) => {
      const bullet = a === this.player.zone ? b : a;
      this.handlePlayerHit(bullet);
    });

    this.physics.add.overlap(this.player.grazeZone, this.enemyBulletPool.group, (a, b) => {
      const bullet = a === this.player.grazeZone ? b : a;
      if (bullet.getData('grazed')) return;
      bullet.setData('grazed', true);
      this.scoreManager.addGraze();
    });

    this.physics.add.overlap(this.playerShotPool.group, this.enemyGroup, (a, b) => {
      const shot = typeof a.deactivate === 'function' ? a : b;
      const enemySprite = shot === a ? b : a;
      shot.deactivate();
      const enemy = enemySprite.getData('enemyRef');
      if (enemy) enemy.takeDamage(this.player.config.shot.damage);
    });
  }

  scheduleStage() {
    for (const spawn of STAGE1.spawns) {
      this.time.delayedCall(spawn.at, () => this.spawnEnemy(spawn));
    }
    this.time.delayedCall(STAGE1.bossAt, () => this.spawnBoss());
  }

  spawnEnemy(spawn) {
    if (this.gameEnded) return;
    const config = ENEMY_TYPES[spawn.type] || BASIC_ENEMY;
    const x = PLAYFIELD.x + PLAYFIELD.width * spawn.x;
    const y = PLAYFIELD.y + PLAYFIELD.height * spawn.y;
    const enemy = new Enemy(
      this,
      x,
      y,
      config,
      this.enemyBulletPool,
      () => ({ x: this.player.x, y: this.player.y }),
      (deadEnemy) => {
        this.enemies = this.enemies.filter((e) => e !== deadEnemy);
        this.scoreManager.addScore(500);
        this.spawnItemsAt(deadEnemy.x, deadEnemy.y);
      },
    );
    this.enemies.push(enemy);
    this.enemyGroup.add(enemy.sprite);
  }

  spawnBoss() {
    if (this.gameEnded) return;
    this.enemies.forEach((e) => {
      e.onDeath = null;
      e.destroy();
    });
    this.enemies = [];
    this.enemyBulletPool.group.getChildren().forEach((b) => {
      if (b.active) b.deactivate();
    });

    this.boss = new Boss(
      this,
      PLAYFIELD.x + PLAYFIELD.width / 2,
      PLAYFIELD.y + 130,
      STAGE1_BOSS,
      this.enemyBulletPool,
      () => ({ x: this.player.x, y: this.player.y }),
      {
        onCardStart: (card) => this.banner.showCard(card.name),
        onCardEnd: (card, captured) => {
          if (captured) {
            this.scoreManager.addScore(3000);
            this.showFloatingText(this.boss.x, this.boss.y - 40, 'Card Captured! +3000', '#ffff88');
          }
        },
        onDefeated: () => {
          this.scoreManager.addScore(10000);
          this.onStageClear();
        },
      },
    );
    this.enemyGroup.add(this.boss.sprite);
  }

  spawnItemsAt(x, y) {
    const drops = rollDrops(Phaser.Math.Between(2, 3));
    drops.forEach((type, i) => {
      const config = ITEM_TYPES[type];
      const item = new Item(this, x + i * 6, y, type, config);
      this.items.push(item);
    });
  }

  handlePlayerHit(bullet) {
    bullet.deactivate();
    if (this.gameEnded || this.player.isInvincible(this.time.now)) return;

    const bombBuffered = this.time.now - this.lastBombPressedAt < 200;
    if (bombBuffered && this.scoreManager.bombs > 0) {
      this.useBomb();
      return;
    }

    this.scoreManager.lives -= 1;
    this.player.flashHit();
    this.player.setInvincibleUntil(this.time.now + 1500);
    if (this.boss) this.boss.notifyPlayerHit();

    if (this.scoreManager.lives <= 0) {
      this.onGameOver();
    }
  }

  useBomb() {
    this.scoreManager.bombs -= 1;
    this.enemyBulletPool.group.getChildren().forEach((b) => {
      if (b.active) {
        this.scoreManager.addScore(10);
        b.deactivate();
      }
    });
    this.player.setInvincibleUntil(this.time.now + 2000);
    this.cameras.main.flash(200, 255, 255, 255);
  }

  showFloatingText(x, y, text, color) {
    const t = this.add
      .text(x, y, text, { fontFamily: 'monospace', fontSize: '14px', color })
      .setOrigin(0.5)
      .setDepth(150);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 1200, onComplete: () => t.destroy() });
  }

  onGameOver() {
    this.gameEnded = true;
    this.messageText.setText('GAME OVER\n\nPress R to restart').setVisible(true);
  }

  onStageClear() {
    this.gameEnded = true;
    this.messageText.setText(`STAGE 1 CLEAR!\nSCORE ${this.scoreManager.score}\n\nPress R to restart`).setVisible(true);
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

    if (this.gameEnded) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }
      return;
    }

    this.player.update(this.inputManager, time);

    if (this.inputManager.bombJustPressed) {
      this.lastBombPressedAt = time;
      if (this.scoreManager.bombs > 0) this.useBomb();
    }

    this.items = this.items.filter((item) => {
      if (item.y > PLAYFIELD.y + PLAYFIELD.height + 40) {
        item.destroy();
        return false;
      }
      const collectLineY = PLAYFIELD.y + 90;
      const dx = item.x - this.player.x;
      const dy = item.y - this.player.y;
      const closeToPlayer = dx * dx + dy * dy < 40 * 40;
      if (this.player.y < collectLineY || closeToPlayer) {
        this.scoreManager.addScore(item.config.scoreValue);
        item.destroy();
        return false;
      }
      return true;
    });

    this.hud.update(this.boss);
  }
}
