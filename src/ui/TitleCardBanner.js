import { PLAYFIELD } from '../config/constants.js';

export default class TitleCardBanner {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(PLAYFIELD.width / 2, -60).setDepth(150);
    const bg = scene.add.rectangle(0, 0, PLAYFIELD.width - 20, 44, 0x220022, 0.85);
    this.text = scene.add
      .text(0, 0, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
      .setOrigin(0.5);
    this.container.add([bg, this.text]);
  }

  showCard(name) {
    this.text.setText(name);
    this.scene.tweens.killTweensOf(this.container);
    this.container.setY(-60);
    this.scene.tweens.add({
      targets: this.container,
      y: 60,
      duration: 350,
      ease: 'Cubic.Out',
      onComplete: () => {
        this.scene.time.delayedCall(1600, () => {
          this.scene.tweens.add({ targets: this.container, y: -60, duration: 350, ease: 'Cubic.In' });
        });
      },
    });
  }
}
