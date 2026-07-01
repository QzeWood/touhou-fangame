# Handoff Notes — touhou-fangame

This project was built with Claude Code and is being handed off to continue
in Codex. This doc is the briefing: what this is, what's done, what's
deliberately cut, and what's left.

## What this is

A non-commercial dōjin (fan tribute) 2D danmaku shooter paying homage to
Touhou Project — Gensokyo setting, homage character names (Reimu Hakurei as
the playable ship, Rumia as the stage-1 boss), classic bullet-hell mechanics.
No copyrighted Touhou art/audio assets are used — everything is programmatic
vector/shape graphics (Phaser `Graphics`/`Arc`), swappable later for real art.

- **Repo:** https://github.com/QzeWood/touhou-fangame
- **Live build:** https://qzewood.github.io/touhou-fangame/ (deployed from the
  `gh-pages` branch, built from `dist/`)
- **Stack:** Phaser 3.90.0 + Vite, vanilla JS ES modules, no TypeScript, no
  backend. Arcade Physics only (circle bodies) — no Matter.js.

## Run / build / deploy

```bash
npm install
npm run dev       # http://localhost:5173, Vite HMR
npm run build     # -> dist/
npm run deploy    # build + push dist/ to gh-pages branch (via `gh-pages` npm package)
```

`vite.config.js` sets `base: './'` — required for both itch.io (served from
an iframe subpath) and GitHub Pages (served from `/touhou-fangame/`). Don't
remove this or asset paths will 404 off `localhost`.

**Controls:** Arrow keys/WASD move, Shift = focus (slow movement, reveals the
tiny hitbox dot), Space = shoot, X = bomb, R = restart after game over/clear.

## Architecture — read this before adding content

The core design principle: **`src/systems/` is generic reusable engine code,
`src/data/` is pure content configuration.** Adding a new stage, enemy, or
boss should mean adding a new file under `data/`, never touching engine code
in `systems/` or `entities/`. Keep it that way — it's the only thing that
makes authoring dozens of bullet patterns tractable.

### Danmaku pattern engine (`src/systems/danmaku/`)
- `patternPrimitives.js` — pure functions: `radialBurst`, `aimedShot`,
  `spiral`, `wave`. Each takes `(bulletPool, x, y, target, args)` and fires
  bullets. `spiral` persists rotation state by mutating `args._angle` in
  place (relies on the same `args` object being reused across repeated
  calls — don't clone `args` in the runner).
- `PatternRunner.js` — interprets a pattern's `steps` array (each step is
  `{ interval или at, action, args }`) into `scene.time.addEvent` timers
  that call the matching primitive. One `PatternRunner` instance per
  enemy/boss; call `.stop()` on death to clear timers.
- `BulletPool.js` — pre-sized Arcade Physics group of pooled `Bullet`
  instances (`entities/bullets/Bullet.js`, a `Phaser.GameObjects.Arc`).
  Used for **both** enemy bullets and player shots (two separate pool
  instances, different depth). Off-screen bullets self-deactivate in
  `Bullet.update()`.

### Player (`src/entities/player/Player.js` + `PlayerConfigs.js`)
The hitbox is deliberately decoupled from the visual: `Player.zone` is an
invisible `Phaser.GameObjects.Zone` with a small circle body (the real
collision point, `config.hitboxRadius`, default 3px) — this is what velocity
is applied to and what enemy bullets overlap against. `Player.visual`
(a big triangle `Graphics`) and `Player.hitboxDot` (the focus-reveal dot)
just cosmetically follow `zone.x/y` every frame in `syncVisualPosition()`.
`Player.grazeZone` is a second, bigger circle Zone for graze detection, kept
in sync via `body.reset()` each frame (not velocity-driven).

All character-specific numbers (speed, hitbox/graze radius, ship color, shot
definition) live in `PlayerConfigs.js`. Only `reimu` exists right now —
adding a second character is mostly a data-entry task (see M7 below), not an
engine change, as long as `Player.js` stays driven entirely by `config`.

### Enemies & bosses (`src/entities/enemy/`)
- `Enemy.js` — generic wave enemy: circle sprite + HP + a `PatternRunner`
  driven by `config.pattern`. No movement logic (enemies are stationary in
  the current stage — see "Known rough edges" below).
- `Boss.js` + `systems/spellcard/SpellCardController.js` — a boss is a list
  of "cards" (`{ name, hp, timeLimitMs, pattern }`, see
  `systems/spellcard/SpellCardDefinitions/stage1_boss.js`). The controller
  runs one card's pattern at a time; a card ends when its HP budget hits 0
  **or** its timer expires, whichever first — then `boss.clearBullets()`
  wipes the screen and the next card starts. If the player wasn't hit during
  a card, it's "captured" (bonus score, see `GameScene.spawnBoss`'s
  `onCardEnd` callback). `TitleCardBanner` (in `src/ui/`) is purely a UI
  listener on `onCardStart` — it has no gameplay effect, safe to restyle.

### Items / score (`src/systems/score/`, `src/entities/items/Item.js`)
Deliberately **not pooled** — kill volume is low enough that plain
create/destroy is fine; don't over-engineer this into a pool unless profiling
says otherwise. `GameScene.update()` does the pickup check manually each
frame (distance-to-player OR crossing a "collect line" near the top of the
playfield) rather than an Arcade overlap — simpler for a handful of items.

### Stage flow (`src/scenes/GameScene.js`)
Currently the only scene. It reads `data/stages/stage1.js` (an array of
`{ at, x, y, type }` spawn events, `x`/`y` as 0–1 fractions of the playfield)
and schedules everything via `time.delayedCall`. Boss spawn hard-clears any
remaining wave enemies (via `e.onDeath = null; e.destroy()` — the `onDeath =
null` matters, otherwise the forced clear pays out kill score/items it
shouldn't). On boss defeat or player death, `this.gameEnded = true` freezes
`update()` into an "R to restart" (`scene.restart()`) state — there's no
separate GameOverScene/ResultScene yet (see M10).

## Known rough edges / things to watch for

- **Phaser Arcade Physics `overlap()` argument order is not reliably
  `(object1Member, object2Member)`** when both sides are Groups — verified
  empirically (a same-order assumption threw `TypeError: shot.deactivate is
  not a function` in early testing). All three overlap callbacks in
  `GameScene.setupOverlaps()` disambiguate defensively (duck-typing
  `typeof x.deactivate === 'function'`, or identity-checking against a known
  single object like `player.zone`). If you add a new overlap pair, use the
  same pattern — don't assume argument order.
- **Headless/CI browser testing needs software WebGL flags.** Plain headless
  Chromium throws `Framebuffer Unsupported` and renders solid black with
  Phaser's default WebGL renderer. Playwright launches need:
  `args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']`.
  Without these, screenshots will look blank even though nothing is
  actually broken.
- Enemies have no entrance/exit movement — they spawn in place, sit still,
  and shoot. Fine for a short demo stage, will look flat if stages get
  longer.
- No sound at all. `this.cameras.main.flash()` on bomb is the only "juice."

## Scope status

**Done (M1–M6, M8 from the original milestone plan):** project scaffold,
player movement + tiny hitbox + focus, player shooting, pooled bullets,
data-driven pattern engine (4 primitives), one full wave-based stage, one
3-card spell-card boss with title banners + capture bonus, lives/bombs
(with deathbomb buffer)/graze, item drops + collect line, score, HUD.

**Added after handoff:** M7 character select is now present. The game starts
in `CharacterSelectScene`, supports Reimu, Marisa, and Flandre, and passes
the chosen `playerId` into `GameScene`. Player bullets can now carry
per-bullet damage via `Bullet.fire(..., { damage })`, which keeps multi-shot
characters from being balanced only by global shot damage. Character images,
when added, should live under `public/assets/characters/`.

**Deliberately cut for the fast demo (still open):**
- **M9 — Stages 2 and 3.** Should be almost pure content: new
  `data/stages/stageN.js` + `data/enemies/stageN_enemies.js` +
  `systems/spellcard/SpellCardDefinitions/stageN_boss.js`. If this requires
  engine changes, that's a signal the architecture leaked somewhere.
- **M10 — Meta flow.** No title screen, no pause, no dedicated
  GameOver/Result scenes (currently just a text overlay + restart-on-R
  inside `GameScene`), no `localStorage` high-score persistence.
- **M11 — Polish.** No audio at all, minimal screen-shake/hit-flash juice,
  no perf pass under heavy bullet counts (loosely stress-tested to ~100
  concurrent bullets during dev, not pushed further).

## Suggested next steps for Codex

1. Read this file + skim `GameScene.js` (the integration point for
   everything) before changing anything.
2. Pick up M7 or M9 first — both are additive/data-driven and low-risk.
3. Keep using `npm run dev` + manual/Playwright testing before `npm run
   deploy` — there's no automated test suite yet.
4. If you add automated tests, there isn't an existing convention to match;
   pick whatever's lightest (this project has zero test infra currently).
