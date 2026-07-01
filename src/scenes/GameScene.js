import Phaser from 'phaser';
import { PLAYFIELD, DEPTH } from '../config/constants.js';
import InputManager from '../systems/input/InputManager.js';
import Player from '../entities/player/Player.js';
import { PLAYER_CONFIGS } from '../entities/player/PlayerConfigs.js';

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

    this.inputManager = new InputManager(this);
    this.player = new Player(
      this,
      PLAYFIELD.x + PLAYFIELD.width / 2,
      PLAYFIELD.y + PLAYFIELD.height - 80,
      config,
    );
    this.player.zone.body.setCollideWorldBounds(true);
  }

  drawPlayfieldBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x0a0a14, 1);
    g.fillRect(PLAYFIELD.x, PLAYFIELD.y, PLAYFIELD.width, PLAYFIELD.height);
    g.lineStyle(2, 0x4444aa, 1);
    g.strokeRect(PLAYFIELD.x, PLAYFIELD.y, PLAYFIELD.width, PLAYFIELD.height);
    g.setDepth(DEPTH.BACKGROUND);
  }

  update() {
    this.inputManager.update();
    this.player.update(this.inputManager);
  }
}
