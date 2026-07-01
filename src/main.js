import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';
import GameScene from './scenes/GameScene.js';

new Phaser.Game({ ...gameConfig, scene: [GameScene] });
