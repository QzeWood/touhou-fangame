export const STAGE1_BOSS = {
  name: '闇夜的妖怪 ‧ 露米亞',
  radius: 22,
  color: 0x8855dd,
  cards: [
    {
      name: '夜符「暗夜妖鳥」',
      hp: 60,
      timeLimitMs: 20000,
      pattern: {
        steps: [{ interval: 900, action: 'radialBurst', args: { count: 16, speed: 130, radius: 5, color: 0xaa88ff } }],
      },
    },
    {
      name: '幻符「二重結界」',
      hp: 90,
      timeLimitMs: 22000,
      pattern: {
        steps: [
          { interval: 260, action: 'aimedShot', args: { count: 3, spread: 14, speed: 200, radius: 4, color: 0xffee66 } },
          { interval: 1400, action: 'radialBurst', args: { count: 20, speed: 100, radius: 5, color: 0x88ddff } },
        ],
      },
    },
    {
      name: '闇符「黒暗天女」',
      hp: 120,
      timeLimitMs: 26000,
      pattern: {
        steps: [
          { interval: 90, action: 'spiral', args: { arms: 3, rotationStepDeg: 14, speed: 130, radius: 4, color: 0xff5588 } },
          { interval: 1800, action: 'aimedShot', args: { count: 5, spread: 30, speed: 220, radius: 4, color: 0xffffff } },
        ],
      },
    },
  ],
};
