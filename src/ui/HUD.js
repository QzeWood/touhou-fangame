import { PLAYFIELD, GAME_WIDTH } from '../config/constants.js';

export default class HUD {
  constructor(scene, scoreManager) {
    this.scene = scene;
    this.scoreManager = scoreManager;
    const panelX = PLAYFIELD.width + 20;

    scene.add
      .rectangle(PLAYFIELD.width, 0, GAME_WIDTH - PLAYFIELD.width, PLAYFIELD.height, 0x11111f)
      .setOrigin(0, 0)
      .setDepth(100);

    this.scoreText = scene.add
      .text(panelX, 24, '', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' })
      .setDepth(101);
    this.statusText = scene.add
      .text(panelX, 100, '', { fontFamily: 'monospace', fontSize: '15px', color: '#ffddaa', lineSpacing: 6 })
      .setDepth(101);
    this.bossText = scene.add
      .text(panelX, 220, '', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ff99cc',
        lineSpacing: 6,
        wordWrap: { width: GAME_WIDTH - panelX - 20 },
      })
      .setDepth(101);
    scene.add
      .text(panelX, PLAYFIELD.height - 130, '方向鍵/WASD 移動\nShift 減速判定\nZ 射擊  X 炸彈', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#8899cc',
        lineSpacing: 6,
      })
      .setDepth(101);
  }

  update(boss) {
    const s = this.scoreManager;
    this.scoreText.setText(`SCORE\n${s.score}`);
    this.statusText.setText(
      `LIVES  ${'★'.repeat(Math.max(s.lives, 0))}\nBOMBS  ${'●'.repeat(Math.max(s.bombs, 0))}\nGRAZE  ${s.graze}`,
    );
    if (boss && !boss.dead) {
      const cardName = boss.controller.currentCard ? boss.controller.currentCard.name : '';
      this.bossText.setText(`${boss.config.name}\nHP ${boss.hp}/${boss.maxHp}\n${cardName}`);
    } else {
      this.bossText.setText('');
    }
  }
}
