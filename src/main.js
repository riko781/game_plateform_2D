import Phaser from "phaser";
import { CreateLevel1 } from "./levels/Level1";
import { CreateLevel2 } from "./levels/Level2";
import { level , nextLevel,loadCurrentLevel} from "./levels/LevelManager.js";
import { Enemy } from "./Enemy.js";
import { Player} from "./Player.js";
import { CoreTiming,
    JUMP_HEIGHT,
    GRAVITY, 
    JUMP_FORCE,
    SPEED,
    DASH_SPEED,
    AIR_CONTROL_MULTIPLIER,
    JUMP_CUT_MULTIPLIER,
    RunMetric} from "./core/GameplayConstants";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#808080",
    physics:{default:'arcade',
         arcade: {
            gravity: {
              y: GRAVITY
            },
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

new Phaser.Game(config);
let player;
let enemy;

function preload() {
    const basePath = `${import.meta.env.BASE_URL}assets`;
    const playerPath = `${basePath}/player-Sheet.png`;
    this.load.spritesheet('player', playerPath, { frameWidth: 64, frameHeight: 64 });

    this.load.image('tiles', `${basePath}/tiles/tilemap_packed.png`);
    this.load.image('tile_0004', `${basePath}/tiles/tile_0004.png`);
    this.load.image('tile_0013', `${basePath}/tiles/tile_0013.png`);
    this.load.image('tile_0012', `${basePath}/tiles/tile_0012.png`);
    this.load.image('tile_0021', `${basePath}/tiles/tile_0021.png`);
    this.load.tilemapTiledJSON('level1', `${basePath}/maps/level1.json`);
}

function create() {
    this.physics.world.createDebugGraphic();
    player = new Player(this,nextLevel);
    player.sprite.setDepth(10);
    loadCurrentLevel(this,player,level);

    if(RunMetric.levelStartTime === 0){
        RunMetric.levelStartTime = performance.now();
    }

    const camera = this.cameras.main;

    camera.setBounds(0, 0, level.map.widthInPixels, level.map.heightInPixels);
    camera.startFollow(player.sprite, true, 0.1,  0.1);
}

function update(timer, delta) {
    level?.movingPlatform?.update?.();
    player.update(delta);
    level.enemies?.forEach(enemy => enemy.update());
    level.movingPlatforms?.forEach(platform => platform.update());

    const cam = this.cameras.main;
    const vx = player.sprite.body.velocity.x;

    // transforme vitesse en direction fluide
    const dir = Phaser.Math.Clamp(vx / 200, -1, 1);
    const targetOffsetX = dir * 60;

    cam.followOffset.x = Phaser.Math.Linear(
        cam.followOffset.x,
        targetOffsetX,
        0.06
    );
}
