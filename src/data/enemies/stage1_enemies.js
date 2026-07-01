export const BASIC_ENEMY = {
  hp: 20,
  radius: 16,
  color: 0x7744cc,
  pattern: {
    steps: [{ interval: 1200, action: 'radialBurst', args: { count: 12, speed: 140, radius: 5, color: 0xff6644 } }],
  },
};

export const AIMED_ENEMY = {
  hp: 26,
  radius: 15,
  color: 0x33aadd,
  pattern: {
    steps: [{ interval: 700, action: 'aimedShot', args: { count: 3, spread: 12, speed: 220, radius: 4, color: 0x99eeff } }],
  },
};
