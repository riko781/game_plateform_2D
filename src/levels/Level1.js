import { JUMP_FORCE } from '../core/GameplayConstants.js';
import { Enemy } from '../Enemy';

export function CreateLevel1(scene,player) {
    //enemy
    const enemies = [];
    const map = scene.make.tilemap({ key: 'level1' });
    const tileset = map.addTilesetImage('tileset-tiles', 'tiles');
    const tile_0004 = map.addTilesetImage('tile_0004', 'tile_0004');
    const tile_0012 = map.addTilesetImage('tile_0012', 'tile_0012');
    const tile_0013 = map.addTilesetImage('tile_0013', 'tile_0013');
    const tile_0021 = map.addTilesetImage('tile_0021', 'tile_0021');
    const background  = map.createLayer('background', [tile_0012,tile_0004,tile_0013,tile_0021], 0, 0);
    const map_layer_1  = map.createLayer('Tile Layer 1', [tileset], 0, 0);

    scene.physics.world.setBounds(
        0,
        0,
        map.widthInPixels,
        map.heightInPixels
    );

    scene.cameras.main.setBounds(
        0,
        0,
        map.widthInPixels,
        map.heightInPixels
    );

    map_layer_1.setCollisionByProperty({ collides: true });
    
    enemies.push(
        new Enemy(scene, 1250, 200 ,800, 1200,14,2)
    );

    const enemy = enemies[0];
    //platforms
    const rectangle = scene.add.rectangle(200, 0, 10, 10, 0x632800);
    const goal = scene.add.rectangle(1080,450,60,300,0x00ff00);
    
    //physics
    scene.physics.add.existing(rectangle);
    scene.physics.add.existing(goal,true);
   
    //colliders  
    scene.physics.add.collider(rectangle,map_layer_1);
    scene.physics.add.collider(player.sprite,map_layer_1);
    scene.physics.add.collider(enemy.sprite,map_layer_1);

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
        goal,
        () => {
            console.log("YOU WIN");
            player.win();
        }
    );

    return {
        map,
        enemies,
        movingPlatform: {},
        spawn: {x: 200, y: 400},
        goal
    }
}