import Phaser from "phaser";

const CoreTiming = {
    movement:{
        coyote: 120, //ms
        jumpBuffer: 100, //ms
        dashDuration: 180, //ms
        landing: 60, //ms
        timeToApex: 0.28, //ms, temps moyen pour atteindre le point le plus haut d'un saut, utilisé pour le jump cut
    },
    
    combat:{
        hitdeath: 600, //ms
    },

    game:{
        winDelay: 1500, //ms
    }

}

const JUMP_HEIGHT = 130;
const GRAVITY = (JUMP_HEIGHT * 2) / (CoreTiming.movement.timeToApex * CoreTiming.movement.timeToApex); // calcul de la gravité pour atteindre la hauteur de saut désirée en un temps donné
const JUMP_FORCE = -GRAVITY * CoreTiming.movement.timeToApex; // calcul de la force de saut nécessaire pour atteindre la hauteur désirée
const SPEED = 140;
const DASH_SPEED = 380;
const AIR_CONTROL_MULTIPLIER = 0.45;
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
        player.scene.cameras.main.shake(40, 0.003);
        player.sprite.setScale(1.2, 0.8); // squash instant
    }

    update(player, delta){
        player.stateLockTimer = Math.max(0, player.stateLockTimer - delta);

        if(player.stateLockTimer <= 0){
            player.sprite.body.setAllowGravity(true);
            player.sprite.setScale(1, 1);

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
        RunMetric.attempts ++;
        player.scene.scene.restart();
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

class WinnerState {
    timer = 1000;
    constructor(player) {
        this.timer = CoreTiming.game.winDelay;
    }

    enter(player) {
        // Stop total du contrôle
        player.sprite.body.setVelocity(0, 0);

        player.sprite.body.setAllowGravity(false);

        // reset inputs (optionnel mais safe)
        player.walk = false;
        player.backWalk = false;

        player.scene.physics.pause();

        player.scene.cameras.main.flash(150, 255, 255, 255);

    }

    update(player, delta) {
        this.timer -= delta;
    
        // option : respawn automatique
        if (this.timer <= 0) {
            player.scene.physics.resume();

            return new RespawnState(player);
        }
    }
}
class JumpState{
    constructor(player){
    }
    
    enter(player){
        player.sprite.body.velocity.y = JUMP_FORCE;
        player.sprite.body.setAllowGravity(true);
        player.sprite.anims.stop();
        player.sprite.setFrame(10);
        player.scene.cameras.main.shake(20, 0.002);

        if (player.jumpBufferTimer > 0){
            player.jumpBufferTimer = 0;
        }
    }

    update(player,delta){
        player.stateLockTimer = Math.max(0, player.stateLockTimer - delta);
        player.airTime += delta;

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

    update(player, delta) {
        const FALL_MULTIPLIER = 1.35;

        const isFalling = player.sprite.body.velocity.y > 0;

        if (isFalling) {
            player.sprite.body.velocity.y += GRAVITY * 0.015 * (delta / 16.66) * (FALL_MULTIPLIER - 1);
        }

        //activation du dash
        if(player.dashJustDown && (player.lastDirection !== undefined || player.direction !== 0)){
            return new DashState(player);
        }

        if (player.isGrounded) {
            player.airTime = 0;

            if (player.jumpBufferTimer > 0) {
                player.jumpBufferTimer = 0;
                return new JumpState(player);
            } else {
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
        player.sprite.body.velocity.y = 0;
        player.sprite.body.velocity.x *= 0.85;
    }

    update(player, delta){
        this.timer -= delta;

        const direction = 
            player.walk ? 1 : 
            player.backWalk ? -1 : 0;

        if(direction !== 0){
            return new WalkState(player);
        }

        if(this.timer <= 0){
            return new IdleState(player);
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

const RunMetric = {
    deaths : 0,
    attempts : 0,
    levelStartTime : 0,
}

class Enemy{
    scene;
    sprite;
    direction;
    speed;
    leftBound;
    rightBound;

    constructor(scene, x, y,leftBound, rightBound) {
        this.scene = scene;
        this.sprite = scene.add.rectangle(x, y, 40, 40, 0xff0000);
        this.leftBound = leftBound;
        this.rightBound = rightBound;

        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);

        this.direction = -1;
        this.speed = 50;
    }

    update(){
        
        if(this.sprite.body === undefined)
            return false;

        this.sprite.body.setVelocityX(this.direction * this.speed);

        //mini patrouille simple
        if(this.sprite.x < this.leftBound){
            this.direction = 1;
        }

        if(this.sprite.x > this.rightBound){
            this.direction = -1;
        }
    }

    kill (){
        this.sprite.destroy();
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
    debugText;
    debugGraphics;
    lastStateName;
    airTime = 0;
    landingFlashTimer = 0;
    landingFlashDuration = 120;
    cameraOffsetX = 0;

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

        
        const dangerStart = scene.add.rectangle(1300,430,120,20,0x632800);
        const enemyPlatform = scene.add.rectangle(1450,430,220,20,0x632800);
        const exitPlatform = scene.add.rectangle(1650,430,120,20,0x632800);
        const goal = scene.add.rectangle(1800,350,60,120,0x00ff00);

        var plateForm_1 = scene.add.rectangle(450, 500, 200, 20, 0x632800);
        var plateForm_2 = scene.add.rectangle(650, 440, 200, 20, 0x632800);
        var plateForm_3 = scene.add.rectangle(850, 450, 50, 20, 0x632800);
        var plateForm_4 = scene.add.rectangle(950, 450, 50, 20, 0x632800);
        this.plateForm_5 = new MovingPlatform(scene, 1100, 400, 100, 20, 50, 50);
      
        //physics
        scene.physics.add.existing(rectangle);
        scene.physics.add.existing(dangerStart,true);
        scene.physics.add.existing(enemyPlatform,true);
        scene.physics.add.existing(exitPlatform,true);
        scene.physics.add.existing(goal,true);
        scene.physics.add.existing(sol,true);
        scene.physics.add.existing(plateForm_1,true);
        scene.physics.add.existing(plateForm_2,true);
        scene.physics.add.existing(plateForm_3,true);
        scene.physics.add.existing(plateForm_4,true);
        
        scene.physics.add.collider(rectangle,sol);
        scene.physics.add.collider(this.sprite,dangerStart);
        scene.physics.add.collider(this.sprite,exitPlatform);
        scene.physics.add.collider(this.sprite,sol);
        scene.physics.add.collider(this.sprite,plateForm_1);
        scene.physics.add.collider(this.sprite,plateForm_2);
        scene.physics.add.collider(this.sprite,enemyPlatform);
        scene.physics.add.collider(enemy.sprite,enemyPlatform);
        scene.physics.add.collider(this.sprite,plateForm_3);
        scene.physics.add.collider(this.sprite,plateForm_4);
        scene.physics.add.collider(this.sprite,this.plateForm_5.platform);

        //input
        const cursors = scene.input.keyboard.createCursorKeys();
        this.dKeyObject = cursors.right; 
        this.qKeyObject = cursors.left;
        this.spaceKeyObject = cursors.space;
        this.shiftKeyObject = cursors.up;
        this.hKeyObject = scene.input.keyboard.addKey("h");

        //debug text
        this.debugText = scene.add.text(10,10,'', { 
            font: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 6, y: 4 },
        });

        
        this.debugText.setScrollFactor(0);
        this.debugText.setDepth(9999);

        //debug graphique
        this.debugGraphics = scene.add.graphics();
       
        //players state initialization
        this.currentState = new IdleState(this);

        scene.physics.add.overlap(
            this.sprite,
            enemy.sprite,
            () => {
                // si le joueur tombe dessus
                if (this.sprite.body.velocity.y > 0
                    && this.sprite.y < enemy.sprite.y) {

                    enemy.kill();

                    this.sprite.body.velocity.y = JUMP_FORCE * 0.6;

                } else {

                    this.kill();
                }
            }
        );

        scene.physics.add.overlap(
            this.sprite,
            goal,
            () => {
                console.log("YOU WIN");
                this.win();
            }
        );
    }

    updateDebugText(delta){
        this.debugText.setText([
            `transition: ${this.lastStateName ?? 'N/A'} → ${this.currentState.constructor.name}`,
            `state: ${this.currentState.constructor.name}`,
            `airTime: ${this.airTime.toFixed(0)}`,
            `isGrounded: ${this.isGrounded}`,
            `velocity x: ${this.sprite.body.velocity.x.toFixed(1)}`,
            `velocity y: ${this.sprite.body.velocity.y.toFixed(1)}`,
            `coyoteTimer: ${this.coyoteTimer.toFixed(0)}`,
            `jumpBufferTimer: ${this.jumpBufferTimer.toFixed(0)}`,
            `direction: ${this.direction}`,
            `landTimer: ${this.currentState instanceof LandingState ? this.currentState.timer.toFixed(0) : 'N/A'}`,
            `fps: ${(1000 / delta).toFixed(0)}`,
        ]);
    }

    kill () {
        if(this.currentState instanceof DeadState) return; // déjà mort
        RunMetric.deaths ++;
        this.transitionTo(new DeadState(this));
    }

    win() {
        const completionTime = (performance.now() - RunMetric.levelStartTime) / 1000;
        
        console.log("LEVEL COMPLETE");
        console.log( "Time:", completionTime.toFixed(2), "s" );
        console.log( "Deaths:", RunMetric.deaths );

        if(this.currentState instanceof WinnerState) return; // déjà en train de respawn
        this.transitionTo(new WinnerState(this));
    }

    transitionTo(newState){
        this.lastStateName = this.currentState?.constructor.name;
        this.currentState?.exit?.(this);
        this.currentState = newState;
        this.currentState?.enter?.(this);
    }

    update(delta){
        this.isGrounded = this.sprite.body.blocked.down;
        const justLanded = this.isGrounded && !this.wasGrounded;

        if(justLanded){
            this.landingFlashTimer = this.landingFlashDuration;
            this.scene.cameras.main.flash(80, 255, 255, 255, true);
        }

        this.landingFlashTimer = Math.max(0, this.landingFlashTimer - delta);

        this.readInput();
        this.updateTimers(delta);

        if(!(this.currentState instanceof WinnerState)){
            enemy.update();
            this.plateForm_5.update();
        }

        const nextState = this.currentState?.update(this,delta);

        if(nextState){
            this.transitionTo(nextState);
        }

        if (!this.sprite.body.blocked.left && this.sprite.x < 0) {
            this.kill();
        }

        this.applyPhysics();
        this.updateAnimation(delta);
        this.wasGrounded = this.sprite.body.blocked.down;

        //debug
        this.updateDebugText(delta);
        this.debugGraphics.clear();
        this.debugGraphics.lineStyle(2, this.isGrounded ? 0x00ff00 : 0xff0000);
        this.debugGraphics.strokeRect(this.sprite.body.x, this.sprite.body.y, this.sprite.body.width, this.sprite.body.height);

        if (this.landingFlashTimer > 0) {
            const progress =
                this.landingFlashTimer / this.landingFlashDuration;

            const radius = 20 * (1 - progress);

            this.debugGraphics.lineStyle(
                2,
                0xffff00,
                progress
            );

            this.debugGraphics.strokeCircle(
                this.sprite.body.center.x,
                this.sprite.body.bottom,
                radius
            );
        }

        const centerX = this.sprite.body.center.x;
        const centerY = this.sprite.body.center.y;
        this.debugGraphics.lineStyle(2, 0x00ffff);
        this.debugGraphics.lineBetween(centerX, centerY, centerX + this.sprite.body.velocity.x * 0.2, centerY + this.sprite.body.velocity.y * 0.2);
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
        if(this.currentState instanceof DashState) return; // DashState gère sa propre vitesse horizontale

        this.direction = this.walk ? 1 : this.backWalk ? -1 : 0;

        const targetSpeed = this.direction * SPEED;
        const acceleration = this.isGrounded ? 0.12 : 0.06;
        const deceleration = this.isGrounded ? 0.18 : 0.08;
        const velocityX = this.sprite.body.velocity.x;


        if (this.direction === 0) {
            const newVelocity = Phaser.Math.Linear(velocityX, 0, deceleration * 0.8);
            this.sprite.body.velocity.x = Math.abs(newVelocity) < 1 ? 0 : newVelocity; 
            return;
        }else{
            this.lastDirection = this.direction;
        }

        const turnBoost =
            Math.sign(velocityX) !== 0 &&
            Math.sign(velocityX) !== Math.sign(targetSpeed)
                ? 1.4
                : 1;
        
        const finalAcceleration = acceleration * turnBoost;

        this.sprite.body.velocity.x = Phaser.Math.Linear(velocityX, targetSpeed, finalAcceleration);
        this.lastDirection  = this.direction;
        this.sprite.setFlipX(this.direction === -1);
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
let enemy;

function preload() {
    const playerPath = `${import.meta.env.BASE_URL}assets/player-Sheet.png`;
    this.load.spritesheet('player', playerPath, { frameWidth: 64, frameHeight: 64 });
}

function create() {
    enemy = new Enemy(this, 1450, 380,1380, 1520);
    player = new Player(this);

    if(RunMetric.levelStartTime === 0){
        RunMetric.levelStartTime = performance.now();
    }

    const camera = this.cameras.main;

    camera.setBounds(0, 0, 3000, 600);
    camera.startFollow(player.sprite, true, 0.1, 0.1);
}

function update(timer, delta) {
    player.update(delta);
    
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
