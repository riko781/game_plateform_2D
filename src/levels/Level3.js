import { MovingPlatform } from '../MovingPlateform.js';
import { JUMP_FORCE } from '../core/GameplayConstants.js';
import { Enemy } from '../Enemy.js';

export function CreateLevel3(scene,player) {
    //enemy
    const enemies = [];

    enemies.push(
        new Enemy(scene, 1450, 380,1380, 1520)
    );

    const enemy = enemies[0];

    //platforms
    const rectangle = scene.add.rectangle(200, 0, 10, 10, 0x00ff00);
    const beach_water = scene.add.rectangle(1350, 600, 2000, 50, 0x87CEEB);
    const dangerStart = scene.add.rectangle(1300,430,120,20,0x632800);
    const goal = scene.add.rectangle(1800,350,60,120,0x00ff00);
    const enemyPlatform = scene.add.rectangle(1450,430,220,20,0x632800);
    const solPlatform = scene.add.rectangle(175, 600, 348, 100, 0x632800);
    const exitPlatform = scene.add.rectangle(1650,430,120,20,0x632800);
    
    const plateForm_1 = scene.add.rectangle(450, 500, 200, 20, 0x632800);
    const plateForm_2 = scene.add.rectangle(650, 440, 200, 20, 0x632800);
    const plateForm_3 = scene.add.rectangle(850, 450, 50, 20, 0x632800);
    const plateForm_4 = scene.add.rectangle(950, 450, 50, 20, 0x632800);
    
    //moving platform
    const movingPlatform = new MovingPlatform(scene, 1100, 400, 100, 20, 50, 50);
    
    //physics
    scene.physics.add.existing(beach_water,true);
    scene.physics.add.existing(rectangle);
    scene.physics.add.existing(dangerStart,true);
    scene.physics.add.existing(enemyPlatform,true);
    scene.physics.add.existing(exitPlatform,true);
    scene.physics.add.existing(goal,true);
    scene.physics.add.existing(solPlatform,true);
    scene.physics.add.existing(plateForm_1,true);
    scene.physics.add.existing(plateForm_2,true);
    scene.physics.add.existing(plateForm_3,true);
    scene.physics.add.existing(plateForm_4,true);

    //colliders  
    scene.physics.add.collider(rectangle,solPlatform);
    scene.physics.add.collider(player.sprite,dangerStart);
    scene.physics.add.collider(player.sprite,exitPlatform);
    scene.physics.add.collider(player.sprite,solPlatform);
    scene.physics.add.collider(player.sprite,plateForm_1);
    scene.physics.add.collider(player.sprite,plateForm_2);
    scene.physics.add.collider(player.sprite,enemyPlatform);
    scene.physics.add.collider(enemy.sprite,enemyPlatform);
    scene.physics.add.collider(player.sprite,plateForm_3);
    scene.physics.add.collider(player.sprite,plateForm_4);
    scene.physics.add.collider(player.sprite,movingPlatform.platform);

    //overlap
    scene.physics.add.overlap(player.sprite, beach_water, () => {
        player.kill();
    });

    scene.physics.add.overlap(
        player.sprite,
        enemy.sprite,
        () => {
            // si le joueur tombe dessus
            if (player.sprite.body.velocity.y > 0
                && player.sprite.y < enemy.sprite.y) {

                enemy.kill();

                player.sprite.body.velocity.y = JUMP_FORCE * 0.6;

            } else {

                player.kill();
            }
        }
    );

    scene.physics.add.overlap(
        player.sprite,
        goal,
        () => {
            console.log("YOU WIN");
            player.win();
        }
    );

    return {
        enemies,
        movingPlatform: movingPlatform
    }

}