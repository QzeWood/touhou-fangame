import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import GameScene from './scenes/GameScene.js';

new Phaser.Game({ ...gameConfig, scene: [CharacterSelectScene, GameScene] });
