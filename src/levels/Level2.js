import { JUMP_FORCE } from '../core/GameplayConstants.js';
import { Enemy } from '../Enemy';

export function CreateLevel2(scene,player) {
    //enemy
    const enemies = [];

    enemies.push(
        new Enemy(scene, 750, 200 ,650, 800),
        new Enemy(scene, 850, 200 ,870, 1030)
    );

    const enemy = enemies[0];
    const enemy2 = enemies[1];
    //platforms
    const rectangle = scene.add.rectangle(200, 0, 10, 10, 0x00ff00);
    const goal = scene.add.rectangle(1080,450,60,300,0x00ff00);
    const solPlatform = scene.add.rectangle(175, 600, 348, 100, 0x632800);
    const exitPlatform = scene.add.rectangle(1650,430,120,20,0x632800);
    
    const plateForm_1 = scene.add.rectangle(449, 550, 200, 100, 0x632800);
    const enemyPlatform = scene.add.rectangle(649, 525, 400, 150, 0x632800);
    const plateForm_3 = scene.add.rectangle(849, 550, 400, 100, 0x632800);
    
    //physics
    scene.physics.add.existing(rectangle);
    scene.physics.add.existing(enemyPlatform,true);
    scene.physics.add.existing(exitPlatform,true);
    scene.physics.add.existing(goal,true);
    scene.physics.add.existing(solPlatform,true);
    scene.physics.add.existing(plateForm_1,true);
    scene.physics.add.existing(plateForm_3,true);

    //colliders  
    scene.physics.add.collider(rectangle,solPlatform);
    scene.physics.add.collider(player.sprite,exitPlatform);
    scene.physics.add.collider(player.sprite,solPlatform);
    scene.physics.add.collider(player.sprite,plateForm_1);
    scene.physics.add.collider(player.sprite,plateForm_3);
    scene.physics.add.collider(enemy2.sprite,plateForm_3);
    scene.physics.add.collider(player.sprite,enemyPlatform);
    scene.physics.add.collider(enemy.sprite,enemyPlatform);

    //overlap
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
        enemy2.sprite,
        () => {
            // si le joueur tombe dessus
            if (player.sprite.body.velocity.y > 0
                && player.sprite.y < enemy2.sprite.y) {

                enemy2.kill();

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
        movingPlatform: {},
        spawn: {x: 200, y: 400},
        goal
    }
}