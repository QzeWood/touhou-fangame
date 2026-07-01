import Phaser from 'phaser';

export default class InputManager {
  constructor(scene) {
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      w: 'W', a: 'A', s: 'S', d: 'D',
      shift: 'SHIFT', z: 'Z', x: 'X',
    });

    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.focus = false;
    this.shoot = false;
    this.bomb = false;
    this.bombJustPressed = false;
  }

  update() {
    this.up = this.cursors.up.isDown || this.keys.w.isDown;
    this.down = this.cursors.down.isDown || this.keys.s.isDown;
    this.left = this.cursors.left.isDown || this.keys.a.isDown;
    this.right = this.cursors.right.isDown || this.keys.d.isDown;
    this.focus = this.keys.shift.isDown;
    this.shoot = this.keys.z.isDown;
    this.bomb = this.keys.x.isDown;
    this.bombJustPressed = Phaser.Input.Keyboard.JustDown(this.keys.x);
  }
}
