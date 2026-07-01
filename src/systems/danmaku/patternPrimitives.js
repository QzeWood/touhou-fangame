export function radialBurst(pool, x, y, target, args = {}) {
  const { count = 12, speed = 140, angleOffset = 0, radius = 5, color = 0xff6644 } = args;
  for (let i = 0; i < count; i++) {
    const angle = angleOffset + (i / count) * Math.PI * 2;
    pool.fire(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, { radius, color });
  }
}

export function aimedShot(pool, x, y, target, args = {}) {
  if (!target) return;
  const { count = 3, spread = 8, speed = 200, radius = 5, color = 0xffee55 } = args;
  const baseAngle = Math.atan2(target.y - y, target.x - x);
  const spreadRad = (spread * Math.PI) / 180;
  for (let i = 0; i < count; i++) {
    const offset = count === 1 ? 0 : (i / (count - 1) - 0.5) * spreadRad;
    const angle = baseAngle + offset;
    pool.fire(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, { radius, color });
  }
}

export function spiral(pool, x, y, target, args = {}) {
  const { arms = 4, rotationStepDeg = 12, speed = 110, radius = 5, color = 0x66ddff } = args;
  args._angle = (args._angle || 0) + (rotationStepDeg * Math.PI) / 180;
  for (let i = 0; i < arms; i++) {
    const angle = args._angle + (i / arms) * Math.PI * 2;
    pool.fire(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, { radius, color });
  }
}

export function wave(pool, x, y, target, args = {}) {
  const { count = 5, spacing = 24, speed = 160, angle = Math.PI / 2, radius = 5, color = 0xff88cc } = args;
  const perp = angle + Math.PI / 2;
  for (let i = 0; i < count; i++) {
    const offset = (i - (count - 1) / 2) * spacing;
    const ox = x + Math.cos(perp) * offset;
    const oy = y + Math.sin(perp) * offset;
    pool.fire(ox, oy, Math.cos(angle) * speed, Math.sin(angle) * speed, { radius, color });
  }
}
