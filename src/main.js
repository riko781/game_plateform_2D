import Phaser from "phaser";

const GRAVITY = 800;
const SPEED = 100;
const JUMP_FORCE = -500;
const DASH_SPEED = 400;
const DASH_TIME = 150; //ms
const AIR_CONTROL_MULTIPLIER = 0.6;
const JUMP_BUFFER_TIME = 120; //ms
const COYOTE_TIME = 100; //ms
const JUMP_START_TIME = 100; //ms
const LANDING_TIME = 80; //ms
const HIT_TIME = 600; //ms

let rectangle;
class LandingState{
    timer = 0;
    constructor(player){
            this.timer = LANDING_TIME;
            player.sprite.body.velocity.x = 0;
    }
    update(player, delta){
        this.timer -= delta;

        if(this.timer <= 0){
            return "FINISHED";
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
    playerState;
    stateLockTimer = 0;
    previousState ;
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

    constructor(scene){
        //world bounds
        scene.physics.world.setBounds(0, 0, 3000, 600);

        //game objects
        rectangle = scene.add.rectangle(200, 0, 10, 10, 0x00ff00);
        this.sprite = scene.physics.add.sprite(100, 100, 'player');
        this.sprite.body.setSize(20, 30);

        var sol = scene.add.rectangle(1500, 600, 3000, 100, 0x632800);

        //physics
        scene.physics.add.existing(rectangle);
        scene.physics.add.existing(this.sprite);
        scene.physics.add.existing(sol,true);
        scene.physics.add.collider(rectangle,sol);
        scene.physics.add.collider(this.sprite,sol);

        //input
        this.dKeyObject = scene.input.keyboard.addKey("d"); 
        this.qKeyObject = scene.input.keyboard.addKey("q");
        this.spaceKeyObject = scene.input.keyboard.addKey("space");
        this.shiftKeyObject = scene.input.keyboard.addKey("p");
        this.hKeyObject = scene.input.keyboard.addKey("h");
        //camera
        let camera = scene.cameras.main;
        camera.startFollow(this.sprite, true, 0.05, 0.05,-360,175);
        camera.setBounds(0, 0, 3000, 600);

        //players state initialization
        this.playerState = PLAYERS_STATE.IDLE;
        this.previousState = null;
    }

    update(delta){
        this.stateLockTimer = Math.max(0, this.stateLockTimer - delta);

        if(this.playerState === PLAYERS_STATE.JUMP){
            console.log("Update State Lock Timer : ", this.stateLockTimer);
        }
        this.isGrounded = this.sprite.body.blocked.down;

        this.readInput();
        this.updateTimers(delta);
        const wantedState = this.computeWantedState();
        const eventState = this.detectEvents(wantedState);
        
        this.processState(wantedState, eventState);
        this.enterState(this.playerState);

        if(this.previousState !== this.playerState){
            if(this.playerState === PLAYERS_STATE.LANDING){
                this.currentState = new LandingState(this);
            }
        }

        const result = this.currentState?.update(this,delta);

        if(result === "FINISHED"){
            console.log("State Finished");
            this.currentState = null;
        }

        this.applyPhysics();
        this.updateAnimation(delta);
        this.wasGrounded = this.sprite.body.blocked.down;
        this.previousState = this.playerState;
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

    computeWantedState(){
        //determine wanted state
        if(this.hitJustDown){
            return PLAYERS_STATE.HIT;
        }
        if(this.dashJustDown){
            return PLAYERS_STATE.DASH;
        }
        if(this.upJustDown){
            return PLAYERS_STATE.JUMP_START;
        }
        if(this.wasGrounded && (this.walk || this.backWalk)){
            return PLAYERS_STATE.WALK;
        }

        if(this.wasGrounded && !this.walk && !this.backWalk){
            return PLAYERS_STATE.IDLE;
        }

        return false;
    }

    detectEvents(){
        //hit detection
        if(this.playerState === PLAYERS_STATE.HIT && this.stateLockTimer <= 0){
            return this.isGrounded ? PLAYERS_STATE.IDLE : PLAYERS_STATE.FALL;
        }

        //dash detection
        if(this.playerState === PLAYERS_STATE.DASH && this.stateLockTimer <= 0){
            return this.isGrounded ? PLAYERS_STATE.IDLE : PLAYERS_STATE.FALL;
        }

        // CUT JUMP (variable jump height)
        if ((this.playerState === PLAYERS_STATE.JUMP || this.playerState === PLAYERS_STATE.JUMP_START) && this.upJustUp && this.sprite.body.velocity.y < 0 ) {
            return "CUT_JUMP";
        }
        //Jump apex detection
        if(this.playerState ==PLAYERS_STATE.JUMP_START && this.sprite.body.velocity.y <= 0){
            return PLAYERS_STATE.JUMP;
        }
        //Falling detection
        if (this.playerState === PLAYERS_STATE.JUMP || this.playerState === PLAYERS_STATE.JUMP_START){
            if(!this.sprite.body.blocked.down && this.sprite.body.velocity.y >= 0) {
                //wantedState = PLAYERS_STATE.FALL;
                return PLAYERS_STATE.FALL;
            }
        }

        //Landing detection
        if(!this.wasGrounded && this.isGrounded ){
            if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
                return PLAYERS_STATE.JUMP_START;
            } else {
            // console.log("Landing detected");
                return PLAYERS_STATE.LANDING;
            }
        }

        //iddle detection in grounding
        return false;
    }
    
    applyHorizontalMovement() {

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
            this.jumpBufferTimer = JUMP_BUFFER_TIME;
        }else{
            this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
        }
        //Coyote Time
        if(this.sprite.body.blocked.down){
            this.coyoteTimer = COYOTE_TIME;
        }else{
            this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
        }
    }

    enterState(newState){
    
        if( this.previousState === newState )
            return;
        
        switch(newState){
            case PLAYERS_STATE.DASH:
                this.dashDirection = this.direction !== 0 ? this.direction : this.lastDirection ;
                this.sprite.body.velocity.x = this.dashDirection * DASH_SPEED;
                this.sprite.body.velocity.y = 0;
                this.sprite.body.setAllowGravity(false);
                this.stateLockTimer = DASH_TIME;
                console.log("DASH");
                this.sprite.anims.stop();
                this.sprite.setFrame(16);
                break;
            case PLAYERS_STATE.JUMP_START:
                this.sprite.body.velocity.y = JUMP_FORCE;
                this.jumpBufferTimer = 0;
                this.coyoteTimer = 0;
                this.stateLockTimer = JUMP_START_TIME;
                console.log("JUMP START state lock timer: ", this.stateLockTimer);
                this.sprite.anims.stop();
                this.sprite.setFrame(10);
                break;
            case PLAYERS_STATE.JUMP:
                this.sprite.anims.stop();
                this.sprite.setFrame(10);
                break;
            case PLAYERS_STATE.LANDING:
                console.log("LANDING");
                this.sprite.body.velocity.x = 0;
                this.stateLockTimer = LANDING_TIME;
                break;
            case PLAYERS_STATE.HIT:
                console.log("HIT");
                this.sprite.body.setAllowGravity(false);
                this.sprite.body.velocity.y = 0;
                this.sprite.body.velocity.x = 0;
                this.stateLockTimer = HIT_TIME;
                break;
            case PLAYERS_STATE.IDLE:
                this.idleFrame = 0;
                this.idleTimer = 0;
                this.sprite.setFrame(0);
                break;
            case PLAYERS_STATE.FALL:
                this.sprite.body.setAllowGravity(true);
                break;
        }
    }

    updateAnimation(delta){
        if (this.direction !== 0 && this.sprite.body.velocity.x !== 0) {
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

        if(this.playerState === PLAYERS_STATE.IDLE){
            this.idleTimer += delta;

            while(this.idleTimer >= 300){
                this.idleTimer -= 300;

                this.idleFrame = (this.idleFrame + 1) % 3;
                this.sprite.setFrame(this.idleFrame);
            }
            return;
        }
    }

    processState(wantedState, eventState){
        let nextState = this.playerState;
        if(eventState === "CUT_JUMP"){
            this.sprite.body.velocity.y *= 0.35; // coupe nette
            // IMPORTANT : on casse le lock du jump start
            console.log("CUT JUMP");
            this.stateLockTimer = 0;
            return;
        }
        
        //priorite aux event state
        //console.log("Event State : ", eventState);
        if(eventState && eventState !== "CUT_JUMP"){
            //console.log("Current State : ", this.playerState, " Wanted State : ", wantedState, " Event State : ", eventState);
            nextState = this.requestState(eventState);
        }
        //ensuite on regarde les wanted state
        else if(wantedState){
            nextState = this.requestState(wantedState);
        }
        //console.log("process State : ", nextState);
        this.playerState = nextState;
    }

    requestState(state){

        
        if(state === PLAYERS_STATE.HIT){
            if(this.stateLockTimer > 0){
                return this.playerState;
            }

            return state;
        }

        if(state === PLAYERS_STATE.DASH){
            console.log("Request state lock timer : ", this.stateLockTimer);
            if(this.playerState === PLAYERS_STATE.LANDING){
                return state;
            }
            
            
            if(this.stateLockTimer > 0){
                return this.playerState;
            }
            
            if(this.direction === 0 && this.lastDirection === undefined){
                return this.playerState;
            }
            
            return state;
        }
        if(this.stateLockTimer > 0 && state !== PLAYERS_STATE.JUMP)
            return this.playerState;
        
        switch(state){
            case PLAYERS_STATE.JUMP_START :
                if(this.jumpBufferTimer > 0 && this.coyoteTimer > 0){
                    console.log("Requesting Jump Start");
                    return state;
                }
                break;
            case PLAYERS_STATE.JUMP :
                return state;
            case PLAYERS_STATE.IDLE :
                this.direction = this.walk ? 1 : this.backWalk ? -1 : 0;
                if(this.direction === 0)
                    return state;
                break;
            case PLAYERS_STATE.LANDING:
                return state;
            case PLAYERS_STATE.FALL:
                return state;
        }   

        return this.playerState;
    }
}

const PLAYERS_STATE = {
    IDLE: "idle",
    WALK: "walk",
    JUMP: "jump",
    FALL: "fall",
    JUMP_START: "jump_start",
    LANDING: "landing",
    DASH: "dash",
    HIT: "hit"
};

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
    this.load.spritesheet('player', '/assets/player-Sheet.png', { frameWidth: 64, frameHeight: 64 });
}

function create() {
    player = new Player(this);
}

function update(timer, delta) {
    player.update(delta);
}
