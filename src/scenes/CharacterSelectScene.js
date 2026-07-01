import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants.js';
import { PLAYER_CONFIGS } from '../entities/player/PlayerConfigs.js';

const CARD_WIDTH = 200;
const CARD_HEIGHT = 320;

export default class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelectScene');
  }

  preload() {
    Object.values(PLAYER_CONFIGS).forEach((config) => {
      if (config.portraitKey && config.portraitPath) {
        this.load.image(config.portraitKey, config.portraitPath);
      }
    });
  }

  create() {
    this.characters = Object.values(PLAYER_CONFIGS);
    this.selectedIndex = 0;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      a: 'A',
      d: 'D',
      enter: 'ENTER',
      space: 'SPACE',
    });

    this.drawBackground();
    this.add
      .text(GAME_WIDTH / 2, 54, '東方 Project 射擊遊戲', {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 94, '選擇自機', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffddaa',
      })
      .setOrigin(0.5);

    this.cards = this.characters.map((config, index) => this.createCharacterCard(config, index));

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 52, '←/→ 切換    Enter/Space 開始', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#99aadd',
      })
      .setOrigin(0.5);

    this.refreshSelection();
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keys.a)) {
      this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex - 1, 0, this.characters.length);
      this.refreshSelection();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keys.d)) {
      this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + 1, 0, this.characters.length);
      this.refreshSelection();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.enter) || Phaser.Input.Keyboard.JustDown(this.keys.space)) {
      this.scene.start('GameScene', { playerId: this.characters[this.selectedIndex].id });
    }
  }

  drawBackground() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x090912).setOrigin(0, 0);
    const g = this.add.graphics();
    g.lineStyle(1, 0x25254a, 0.55);
    for (let y = 0; y < GAME_HEIGHT; y += 36) g.lineBetween(0, y, GAME_WIDTH, y);
    for (let x = 0; x < GAME_WIDTH; x += 36) g.lineBetween(x, 0, x, GAME_HEIGHT);
  }

  createCharacterCard(config, index) {
    const spacing = this.characters.length > 2 ? 220 : 280;
    const centerX = GAME_WIDTH / 2 + (index - (this.characters.length - 1) / 2) * spacing;
    const centerY = 350;
    const container = this.add.container(centerX, centerY);

    const bg = this.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, 0x141421, 1).setStrokeStyle(2, 0x404068, 1);
    const portrait = this.createPortrait(config);

    const name = this.add
      .text(0, 78, config.displayName, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    const title = this.add
      .text(0, 112, config.title, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffddaa',
      })
      .setOrigin(0.5);
    const description = this.add
      .text(0, 158, config.description, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#b8c2e8',
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: CARD_WIDTH - 42 },
      })
      .setOrigin(0.5, 0);

    const stats = this.add
      .text(-72, 240, `速度 ${config.speedNormal}\n低速 ${config.speedFocus}\n火力 ${config.shot.damage}`, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#d8ddff',
        lineSpacing: 7,
      })
      .setOrigin(0, 0.5);

    container.add([bg, portrait, name, title, description, stats]);
    return { container, bg, config };
  }

  createPortrait(config) {
    if (config.portraitKey && this.textures.exists(config.portraitKey)) {
      const image = this.add.image(0, -30, config.portraitKey);
      const maxWidth = 118;
      const maxHeight = 132;
      image.setScale(Math.min(maxWidth / image.width, maxHeight / image.height));
      return image;
    }

    const g = this.add.graphics();
    g.clear();
    g.fillStyle(config.color, 1);
    g.fillTriangle(0, -78, -42, 22, 42, 22);
    g.fillStyle(config.accentColor, 1);
    g.fillCircle(0, -18, 18);
    g.lineStyle(2, 0xffffff, 0.8);
    g.strokeCircle(0, -18, 24);
    return g;
  }

  refreshSelection() {
    this.cards.forEach((card, index) => {
      const selected = index === this.selectedIndex;
      card.bg.setFillStyle(selected ? 0x1f1f32 : 0x141421, 1);
      card.bg.setStrokeStyle(selected ? 4 : 2, selected ? card.config.accentColor : 0x404068, 1);
      card.container.setScale(selected ? 1.04 : 0.96);
      card.container.setAlpha(selected ? 1 : 0.65);
    });
  }
}
