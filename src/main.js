import Phaser from "phaser";
import { CreateLevel1 } from "./levels/Level1";
import { CreateLevel2 } from "./levels/Level2";
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
    RunMetric,
    currentLevel,
    nextLevel,
    loadCurrentLevel,
    level} from "./core/GameplayConstants";


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
    const playerPath = `${import.meta.env.BASE_URL}assets/player-Sheet.png`;
    this.load.spritesheet('player', playerPath, { frameWidth: 64, frameHeight: 64 });
}

function create() {
    player = new Player(this,nextLevel);
    loadCurrentLevel(this,player,level);

    if(RunMetric.levelStartTime === 0){
        RunMetric.levelStartTime = performance.now();
    }

    const camera = this.cameras.main;

    camera.setBounds(0, 0, 3000, 600);
    camera.startFollow(player.sprite, true, 0.1, 0.1);
}

function update(timer, delta) {
    level?.movingPlatform?.update();
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
