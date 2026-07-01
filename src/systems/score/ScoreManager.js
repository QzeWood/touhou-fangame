export default class ScoreManager {
  constructor() {
    this.score = 0;
    this.graze = 0;
    this.lives = 3;
    this.bombs = 2;
  }

  addScore(amount) {
    this.score += amount;
  }

  addGraze() {
    this.graze += 1;
    this.score += 10;
  }
}
