import { radialBurst, aimedShot, spiral, wave } from './patternPrimitives.js';

const ACTIONS = { radialBurst, aimedShot, spiral, wave };

export default class PatternRunner {
  constructor(scene, bulletPool) {
    this.scene = scene;
    this.bulletPool = bulletPool;
    this.timers = [];
  }

  run(pattern, getOrigin, getTarget) {
    this.stop();
    if (!pattern) return;
    for (const step of pattern.steps) {
      const timer = this.scene.time.addEvent({
        delay: step.interval ?? step.at ?? 0,
        loop: !!step.interval,
        callback: () => {
          const { x, y } = getOrigin();
          const target = getTarget ? getTarget() : null;
          const action = ACTIONS[step.action];
          if (action) action(this.bulletPool, x, y, target, step.args);
        },
      });
      this.timers.push(timer);
    }
  }

  stop() {
    this.timers.forEach((t) => t.remove());
    this.timers = [];
  }
}
