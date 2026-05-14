import Phaser from "phaser";

const CoreTiming = {
    movement:{
        coyote: 120, //ms
        jumpBuffer: 100, //ms
        dashDuration: 90, //ms
        landing: 60, //ms
        timeToApex: 0.22, //ms, temps moyen pour atteindre le point le plus haut d'un saut, utilisé pour le jump cut
    },
    
    combat:{
        hitdeath: 600, //ms
    }
}

const JUMP_HEIGHT = 120;
const GRAVITY = (JUMP_HEIGHT * 2) / (CoreTiming.movement.timeToApex * CoreTiming.movement.timeToApex); // calcul de la gravité pour atteindre la hauteur de saut désirée en un temps donné
const JUMP_FORCE = -GRAVITY * CoreTiming.movement.timeToApex; // calcul de la force de saut nécessaire pour atteindre la hauteur désirée
const SPEED = 100;
const DASH_SPEED = 400;
const AIR_CONTROL_MULTIPLIER = 0.6;
const JUMP_CUT_MULTIPLIER = 0.35;
let rectangle;

class DashState {
    constructor(player){
        player.stateLockTimer = CoreTiming.movement.dashDuration;
        player.sprite.anims.stop();
        player.sprite.setFrame(16);
    }
    enter(player){
        player.dashDirection = player.direction !== 0 ? player.direction : player.lastDirection ;
        player.sprite.body.velocity.x = player.dashDirection * DASH_SPEED;
        player.sprite.body.velocity.y *= 0.2;
    }

    update(player, delta){
        player.stateLockTimer = Math.max(0, player.stateLockTimer - delta);

        if(player.stateLockTimer <= 0){
            player.sprite.body.setAllowGravity(true);
            
            if(player.isGrounded){
                return new IdleState(player);
            }else{
                return new FallState(player);
            }
        }
    }
}

//Classe pour une plateforme mobile simple, oscillant horizontalement autour d'une position de départ
class MovingPlatform {
    statrtX;
    distance;
    speed;
    platform;
    direction;
    constructor(scene, x, y, width, height, speed, distance) {
        this.startX = x;
        this.distance = distance;
        this.speed = speed;

        this.platform = scene.add.rectangle(x, y, width, height, 0x632800);
        scene.physics.add.existing(this.platform);

        this.platform.body.setImmovable(true);
        this.platform.body.setAllowGravity(false);

        this.direction = 1;
    }

    update() {
        this.platform.body.setVelocityX(this.speed * this.direction);

        if (this.platform.x > this.startX + this.distance) {
            this.direction = -1;
        } else if (this.platform.x < this.startX - this.distance) {
            this.direction = 1;
        }
    }
}
class RespawnState {
    enter(player) {
        player.sprite.setPosition(100, 100);
        player.sprite.body.velocity.set(0, 0);
    }

    update(player) {
        return new IdleState(player);
    }
}
class DeadState {
    timer = 0;
    constructor(player) {
        this.timer = CoreTiming.combat.hitdeath;
    }

    enter(player) {
        // Stop total du contrôle
        player.sprite.body.velocity.x = 0;

        // option : petit knockback
        player.sprite.body.velocity.y = -200;

        player.sprite.body.setAllowGravity(true);

        // reset inputs (optionnel mais safe)
        player.walk = false;
        player.backWalk = false;

        // animation
        player.sprite.anims.stop();
        player.sprite.setFrame(15); // frame "dead"
    }

    update(player, delta) {
        this.timer -= delta;
        // rien → état bloqué

        // option : respawn automatique
        if (this.timer <= 0) {
            return new RespawnState(player);
        }
    }
}
class JumpState{
    constructor(player){
        console.log("JumpState");
    }
    
    enter(player){
        player.sprite.body.velocity.y = JUMP_FORCE;
        player.sprite.body.setAllowGravity(true);
        player.sprite.anims.stop();
        player.sprite.setFrame(10);

        if (player.jumpBufferTimer > 0){
            player.jumpBufferTimer = 0;
        }
    }

    update(player,delta){
        player.stateLockTimer = Math.max(0, player.stateLockTimer - delta);

            //activation du dash
            if(player.dashJustDown && (player.lastDirection !== undefined || player.direction !== 0)){
                return new DashState(player);
            }

            //Transition vers fall
            if(player.sprite.body.velocity.y >= 0) {
                return new FallState(player);
            }
            
            // CUT JUMP 
            if (player.upJustUp && player.sprite.body.velocity.y < 0 ) {
                player.sprite.body.velocity.y *= JUMP_CUT_MULTIPLIER; // coupe nette
            }
    }
}
class FallState{
    constructor(player){}

    enter(player){
        player.sprite.body.setAllowGravity(true);
    }

    update(player){
        if(player.isGrounded){
            if (player.jumpBufferTimer > 0) {
                player.jumpBufferTimer = 0;

                return new JumpState(player);
            }else{
                 return new LandingState(player);
            }
        }
    }
}

class LandingState{
    timer = 0;
    constructor(player){
            this.timer = CoreTiming.movement.landing;
    }

    enter(player){
        player.sprite.body.velocity.x *= 0.5;
    }

    update(player, delta){
        this.timer -= delta;

        if(this.timer <= 0){
            const direction = player.walk ? 1 : player.backWalk ? -1 : 0;

            if(direction !== 0){
               return new WalkState(player);
            }else{
                return new IdleState(player);
            }
        }
    }
}

class WalkState{
    constructor(player){}
    enter(){}

    update(player){

        const direction = player.walk ? 1 : player.backWalk ? -1 : 0;

        if(direction === 0){
            return new IdleState(player);
        }

        if(player.upJustDown && player.coyoteTimer > 0){
            return new JumpState(player);
        }

    }
}
class IdleState{
    constructor(player){}
    enter(){}

    update(player){
        console.log(player.coyoteTimer);
        if(player.upJustDown && player.coyoteTimer > 0){
            return new JumpState(player);
        }

        if(!player.isGrounded){
            return new FallState(player);
        }
        
        const direction = player.walk ? 1 : player.backWalk ? -1 : 0;

        if(direction !== 0){
            return new WalkState(player);
        }
    }
}
class Player{
    upJustDown;
    upJustUp;
    dashJustDown;
    shiftKeyObject;
    isGrounded = false;
    wasGrounded = false;
    jumpBufferTimer = 0;
    coyoteTimer = 0;
    sprite;
    dKeyObject;
    qKeyObject;
    spaceKeyObject;
    stateLockTimer = 0;
    direction;
    walk;
    backWalk;
    dashDirection;
    lastDirection;
    hitJustDown;
    hKeyObject;
    lastX = 0;
    distanceAccum = 0;
    walkFrame = 0;
    idleTimer = 0;
    idleFrame = 0;
    currentState;
    plateForm_5;
    scene;

    constructor(scene){
        this.scene = scene;
        //world bounds
        scene.physics.world.setBounds(0, 0, 3000, 600);

        //game objects
        rectangle = scene.add.rectangle(200, 0, 10, 10, 0x00ff00);
        this.sprite = scene.physics.add.sprite(100, 100, 'player');
        this.sprite.body.setSize(20, 30);

        var sol = scene.add.rectangle(175, 600, 348, 100, 0x632800);
        var beach_water = scene.add.rectangle(1350, 600, 2000, 50, 0x87CEEB);
        scene.physics.add.existing(beach_water, true);
        scene.physics.add.overlap(this.sprite, beach_water, () => {
            if(!(this.currentState instanceof DeadState)){
                this.kill();
            }
        });

        //var plateForm_left = scene.add.rectangle(750, 450, 200, 20, 0x632800);
        var plateForm_1 = scene.add.rectangle(450, 500, 200, 20, 0x632800);
        var plateForm_2 = scene.add.rectangle(650, 440, 200, 20, 0x632800);
        var plateForm_3 = scene.add.rectangle(850, 450, 50, 20, 0x632800);
        var plateForm_4 = scene.add.rectangle(950, 450, 50, 20, 0x632800);
        //var plateForm_5 = scene.add.rectangle(1050, 450, 50, 20, 0x632800);
        this.plateForm_5 = new MovingPlatform(scene, 1150, 400, 100, 20, 50, 100);
      
        //physics
        scene.physics.add.existing(rectangle);
        scene.physics.add.existing(this.sprite);
        scene.physics.add.existing(sol,true);
        scene.physics.add.existing(plateForm_1,true);
        scene.physics.add.existing(plateForm_2,true);
        scene.physics.add.existing(plateForm_3,true);
        scene.physics.add.existing(plateForm_4,true);
        scene.physics.add.existing(this.plateForm_5);
        scene.physics.add.collider(rectangle,sol);
        scene.physics.add.collider(this.sprite,sol);
        scene.physics.add.collider(this.sprite,plateForm_1);
        scene.physics.add.collider(this.sprite,plateForm_2);
        scene.physics.add.collider(this.sprite,plateForm_3);
        scene.physics.add.collider(this.sprite,plateForm_4);
        scene.physics.add.collider(this.sprite,this.plateForm_5.platform);

        //input
        this.dKeyObject = scene.input.keyboard.createCursorKeys().right; 
        this.qKeyObject = scene.input.keyboard.createCursorKeys().left;
        this.spaceKeyObject = scene.input.keyboard.addKey("space");
        this.shiftKeyObject = scene.input.keyboard.addKey("p");
        this.hKeyObject = scene.input.keyboard.addKey("h");
        //camera
        let camera = scene.cameras.main;
        camera.startFollow(this.sprite, true, 0.05, 0.05,-360,175);
        camera.setBounds(0, 0, 3000, 600);

        //players state initialization
        this.currentState = new IdleState(this);
    }

    kill () {
        if(this.currentState instanceof DeadState) return; // déjà mort
        this.transitionTo(new DeadState(this));
    }

    transitionTo(newState){
        this.currentState?.exit?.(this);
        this.currentState = newState;
        this.currentState?.enter?.(this);
    }

    update(delta){
        this.isGrounded = this.sprite.body.blocked.down;

        this.readInput();
        this.updateTimers(delta);

        const nextState = this.currentState?.update(this,delta);
        this.plateForm_5.update();

        if(nextState){
            this.transitionTo(nextState);
        }

        if (!this.sprite.body.blocked.left && this.sprite.x < 0) {
            this.kill();
        }

     

        this.applyPhysics();
        this.updateAnimation(delta);
        this.wasGrounded = this.sprite.body.blocked.down;
    }

    readInput(){
        //read input
        this.walk = this.dKeyObject.isDown;
        this.backWalk = this.qKeyObject.isDown;

        this.upJustDown = Phaser.Input.Keyboard.JustDown(this.spaceKeyObject);
        this.upJustUp = Phaser.Input.Keyboard.JustUp(this.spaceKeyObject);

        this.dashJustDown = Phaser.Input.Keyboard.JustDown(this.shiftKeyObject);
        this.hitJustDown = Phaser.Input.Keyboard.JustDown(this.hKeyObject);
    }
    
    applyHorizontalMovement() {
        if(this.currentState instanceof DeadState) return; // déjà mort
        this.direction = this.walk ? 1 : this.backWalk ? -1 : 0;

        if (this.direction === 0) {
            if (this.isGrounded) {
                this.sprite.body.velocity.x = 0;
            }
            return false;
        }else{
            this.lastDirection = this.direction;
        }

        const control = this.isGrounded ? 1 : AIR_CONTROL_MULTIPLIER;
        this.sprite.body.velocity.x = this.direction * SPEED * control;

        if(this.direction !== 0){
            this.sprite.setFlipX(this.direction === -1);
        }
    }

    applyPhysics(delta){
        return this.applyHorizontalMovement(delta);
    }

    updateTimers(delta){
        //initializations Timers
        if(this.upJustDown){
            this.jumpBufferTimer = CoreTiming.movement.jumpBuffer;
        }else{
            this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
        }
        //Coyote Time
        if(this.isGrounded){
            this.coyoteTimer = CoreTiming.movement.coyote;
        }else{
            this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
        }
    }

   

    updateAnimation(delta){
        if (Math.abs(this.sprite.body.velocity.x) > 5) {
            const dx = Math.abs(this.sprite.x - this.lastX);
            this.lastX = this.sprite.x;

            this.distanceAccum += dx;

            if (this.distanceAccum >= 10) {
                this.distanceAccum = 0;

                this.walkFrame = (this.walkFrame + 1) % 4;
                this.sprite.setFrame(4 + this.walkFrame);
            }
            return;
        }

        if(this.currentState instanceof IdleState){
            this.idleTimer += delta;

            while(this.idleTimer >= 300){
                this.idleTimer -= 300;

                this.idleFrame = (this.idleFrame + 1) % 3;
                this.sprite.setFrame(this.idleFrame);
            }
            return;
        }
    }
}




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

function preload() {
    const playerPath = `${import.meta.env.BASE_URL}assets/player-Sheet.png`;
    this.load.spritesheet('player', playerPath, { frameWidth: 64, frameHeight: 64 });
}

function create() {
    player = new Player(this);
}

function update(timer, delta) {
    player.update(delta);
}
