export const SHOT_DEFINITIONS = {
  reimu: {
    cooldownMs: 90,
    damage: 1,
    radius: 4,
    color: 0x99ddff,
    bullets: [
      { offsetX: -6, speed: 620 },
      { offsetX: 6, speed: 620 },
    ],
  },
  marisa: {
    cooldownMs: 75,
    damage: 0.7,
    radius: 4,
    color: 0xfff066,
    bullets: [
      { offsetX: -3, speed: 760, damage: 0.9 },
      { offsetX: 3, speed: 760, damage: 0.9 },
      { offsetX: -10, offsetY: 4, velocityX: -45, speed: 690, damage: 0.45 },
      { offsetX: 10, offsetY: 4, velocityX: 45, speed: 690, damage: 0.45 },
    ],
  },
  flandre: {
    cooldownMs: 115,
    damage: 1,
    radius: 5,
    color: 0xff66aa,
    bullets: [
      { offsetX: 0, speed: 700, damage: 1.35 },
      { offsetX: -9, offsetY: 2, velocityX: -70, speed: 650, damage: 0.7 },
      { offsetX: 9, offsetY: 2, velocityX: 70, speed: 650, damage: 0.7 },
      { offsetX: -17, offsetY: 8, velocityX: -130, speed: 590, damage: 0.45 },
      { offsetX: 17, offsetY: 8, velocityX: 130, speed: 590, damage: 0.45 },
    ],
  },
};
