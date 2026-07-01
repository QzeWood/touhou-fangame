export const ITEM_TYPES = {
  power: { radius: 6, color: 0x33cc66, scoreValue: 0 },
  point: { radius: 5, color: 0xffcc33, scoreValue: 300 },
};

export function rollDrops(count) {
  const drops = [];
  for (let i = 0; i < count; i++) {
    drops.push(Math.random() < 0.5 ? 'power' : 'point');
  }
  return drops;
}
