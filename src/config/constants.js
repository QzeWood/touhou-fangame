export const PLAYFIELD = { x: 0, y: 0, width: 480, height: 720 };
export const SIDEBAR_WIDTH = 200;
export const GAME_WIDTH = PLAYFIELD.width + SIDEBAR_WIDTH;
export const GAME_HEIGHT = PLAYFIELD.height;

export const DEPTH = {
  BACKGROUND: 0,
  ENEMY: 10,
  ENEMY_BULLET: 20,
  ITEM: 25,
  PLAYER: 30,
  PLAYER_HITBOX: 31,
  PLAYER_BULLET: 35,
  EFFECT: 40,
  UI: 100,
};

export const EVENTS = {
  SPELLCARD_START: 'spellcard:start',
  SPELLCARD_END: 'spellcard:end',
  PLAYER_HIT: 'player:hit',
  PLAYER_GRAZE: 'player:graze',
};
