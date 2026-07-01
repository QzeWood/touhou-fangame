import PatternRunner from '../danmaku/PatternRunner.js';

export default class SpellCardController {
  constructor(scene, boss, cards, callbacks = {}) {
    this.scene = scene;
    this.boss = boss;
    this.cards = cards;
    this.index = -1;
    this.currentCard = null;
    this.cardHp = 0;
    this.playerHitDuringCard = false;
    this.timeoutTimer = null;
    this.patternRunner = new PatternRunner(scene, boss.bulletPool);
    this.onCardStart = callbacks.onCardStart;
    this.onCardEnd = callbacks.onCardEnd;
    this.onAllCardsDone = callbacks.onAllCardsDone;
  }

  start() {
    this.nextCard();
  }

  nextCard() {
    this.index += 1;
    if (this.index >= this.cards.length) {
      this.patternRunner.stop();
      this.currentCard = null;
      if (this.onAllCardsDone) this.onAllCardsDone();
      return;
    }

    this.currentCard = this.cards[this.index];
    this.cardHp = this.currentCard.hp;
    this.playerHitDuringCard = false;

    this.patternRunner.run(
      this.currentCard.pattern,
      () => ({ x: this.boss.x, y: this.boss.y }),
      this.boss.targetProvider,
    );

    if (this.onCardStart) this.onCardStart(this.currentCard);

    if (this.currentCard.timeLimitMs) {
      this.timeoutTimer = this.scene.time.delayedCall(this.currentCard.timeLimitMs, () => this.endCard());
    }
  }

  notifyDamage(amount) {
    if (!this.currentCard) return;
    this.cardHp -= amount;
    if (this.cardHp <= 0) this.endCard();
  }

  notifyPlayerHit() {
    this.playerHitDuringCard = true;
  }

  endCard() {
    if (this.timeoutTimer) {
      this.timeoutTimer.remove();
      this.timeoutTimer = null;
    }
    this.patternRunner.stop();
    const finishedCard = this.currentCard;
    const captured = !this.playerHitDuringCard;
    this.boss.clearBullets();
    if (this.onCardEnd) this.onCardEnd(finishedCard, captured);
    this.nextCard();
  }
}
