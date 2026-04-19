import Phaser from "phaser";

const GRAVITY = 800;
const SPEED = 100;
const JUMP_FORCE = -500;
const FALL_MULTIPLIER = 1.5;
const AIR_CONTROL_MULTIPLIER = 0.6;
const JUMP_BUFFER_TIME = 120; //ms
const COYOTE_TIME = 100; //ms
const JUMP_START_TIME = 100; //ms
const LANDING_TIME = 80; //ms

let isGrounded = false;
let wasGrounded = false;
let jumpBufferTimer = 0;
let coyoteTimer = 0;
let rectangle;
let red_rectangle;
let dKeyObject;
let qKeyObject;
let spaceKeyObject;
let playerState;
let stateLockTimer = 0;
let previousState ;
let direction;
let walk;
let backWalk;
let upJustDown;
let upJustUp;

const PLAYERS_STATE = {
    IDLE: "idle",
    WALK: "walk",
    JUMP: "jump",
    FALL: "fall",
    JUMP_START: "jump_start",
    LANDING: "landing"
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

function preload() {}

function create() {
    //world bounds
    this.physics.world.setBounds(0, 0, 3000, 600);

    //game objects
    rectangle = this.add.rectangle(200, 0, 10, 10, 0x00ff00);
    red_rectangle = this.add.rectangle(40, 0, 10, 10, 0xff0000);
    var sol = this.add.rectangle(1500, 600, 3000, 100, 0x632800);
    //sky = this.add.rectangle(0, 0, 1600, 100, 0x87ceeb);

    //physics
    this.physics.add.existing(rectangle);
    this.physics.add.existing(red_rectangle);
    //red_rectangle.body.setCollideWorldBounds(true);
    this.physics.add.existing(sol,true);
    this.physics.add.collider(rectangle,sol);
    this.physics.add.collider(red_rectangle,sol);

    //input
    dKeyObject = this.input.keyboard.addKey("d"); 
    qKeyObject = this.input.keyboard.addKey("q");
    spaceKeyObject = this.input.keyboard.addKey("space");

    //camera
    let camera = this.cameras.main;
    camera.startFollow(red_rectangle, true, 0.05, 0.05,-360,175);
    camera.setBounds(0, 0, 3000, 600);

    //players state initialization
    playerState = PLAYERS_STATE.IDLE;
    previousState = null;
}

function update(timer, delta) {
    //initializations variable
    let canMove = true;
    let wantedState = false;
    let consumedEvent = false;

    //read input
    walk = dKeyObject.isDown;
    backWalk = qKeyObject.isDown;
    upJustDown = Phaser.Input.Keyboard.JustDown(spaceKeyObject);
    upJustUp = Phaser.Input.Keyboard.JustUp(spaceKeyObject);

    stateLockTimer = Math.max(0, stateLockTimer - delta);
    isGrounded = red_rectangle.body.blocked.down;

    //initializations Timers

    if(wantedState === false && upJustDown){
        jumpBufferTimer = JUMP_BUFFER_TIME;
    }else{
        jumpBufferTimer = Math.max(0, jumpBufferTimer - delta);
    }
    //Coyote Time
    if(red_rectangle.body.blocked.down){
        coyoteTimer = COYOTE_TIME;
    }else{
        coyoteTimer = Math.max(0, coyoteTimer - delta);
    }


    //dectect events
   // if(stateLockTimer <=0){
        //Jump apex detection
        if(playerState ==PLAYERS_STATE.JUMP_START && red_rectangle.body.velocity.y < 0){
            playerState = PLAYERS_STATE.JUMP;
            console.log("Jump apex detected");
        }
        //Falling detection
        if (playerState === PLAYERS_STATE.JUMP || playerState === PLAYERS_STATE.JUMP_START){
            if(!red_rectangle.body.blocked.down && red_rectangle.body.velocity.y >= 0) {
                playerState = PLAYERS_STATE.FALL;
            }
        }
        //Landing detection
        if(!wasGrounded && isGrounded){
           if (jumpBufferTimer > 0) {
                playerState = PLAYERS_STATE.JUMP_START;
            } else {
                playerState = PLAYERS_STATE.LANDING;
                console.log("Landing detected");
            }
        }
    //}

    if ((playerState === PLAYERS_STATE.JUMP || playerState === PLAYERS_STATE.JUMP_START) && upJustUp && red_rectangle.body.velocity.y < 0 ) {
        red_rectangle.body.velocity.y *= 0.35; // coupe nette
        playerState = PLAYERS_STATE.FALL;

        // IMPORTANT : on casse le lock du jump start
        stateLockTimer = 0;

        consumedEvent = true;
    }

    if((playerState === PLAYERS_STATE.JUMP || playerState === PLAYERS_STATE.JUMP_START)){
       red_rectangle.body.velocity.x += direction * SPEED * AIR_CONTROL_MULTIPLIER * (delta / 1000);
    }

    if (playerState === PLAYERS_STATE.FALL) {
        console.log("Applying fall multiplier");
        red_rectangle.body.velocity.y += GRAVITY * (FALL_MULTIPLIER - 1) * (delta / 1000);
    }

    if ( playerState === PLAYERS_STATE.JUMP || playerState === PLAYERS_STATE.FALL ) {
        wantedState = false;
    }

    //determine wanted state
    if(wantedState === false && upJustDown){
        wantedState = PLAYERS_STATE.JUMP_START;
    }
    if(wasGrounded && wantedState === false && (walk || backWalk)){
        wantedState = PLAYERS_STATE.WALK;
    }

    if(wasGrounded && wantedState === false && !walk && !backWalk){
        wantedState = PLAYERS_STATE.IDLE;
    }

    //request state change
    if(wantedState !== false){
        //console.log("Wanted State :", wantedState);
        playerState = requestState(wantedState);
        //console.log("Current State :", playerState);
    }

    if(consumedEvent === false){
        enterState(playerState);
    }
    //state movement 
    if(previousState !== playerState){
        console.log("State changed to :", playerState);
        switch(playerState){
            case PLAYERS_STATE.IDLE:
                red_rectangle.setFillStyle(0xff0000);
                break;
            case PLAYERS_STATE.WALK:
                red_rectangle.setFillStyle(0x00ff00);
                break;
            case PLAYERS_STATE.JUMP:
            case PLAYERS_STATE.JUMP_START:
                red_rectangle.setFillStyle(0x0000ff);
                break;
            case PLAYERS_STATE.FALL:
                red_rectangle.setFillStyle(0xffff00);
                break;
            case PLAYERS_STATE.LANDING:
                red_rectangle.setFillStyle(0xff00ff);
                break;
        }
    }
    //applyHorizontalMovement(delta);

    wasGrounded = red_rectangle.body.blocked.down;
    previousState = playerState;
}
function applyHorizontalMovement(delta) {

    direction = walk ? 1 : backWalk ? -1 : 0;

    if (direction === 0) {
        if (isGrounded) {
            red_rectangle.body.velocity.x = 0;
        }
        return;
    }

    const control = isGrounded ? 1 : AIR_CONTROL_MULTIPLIER;
    red_rectangle.body.velocity.x = direction * SPEED * control;
}

function enterState(newState){
    if(previousState !== newState && stateLockTimer <=0 ){
        switch(newState){
            case PLAYERS_STATE.WALK:
                const controle = red_rectangle.body.blocked.down ? 1: AIR_CONTROL_MULTIPLIER;
                red_rectangle.body.velocity.x = direction * SPEED * controle;
                break;
            case PLAYERS_STATE.IDLE:
                red_rectangle.body.velocity.x = 0;
                break;
            case PLAYERS_STATE.JUMP_START:
                red_rectangle.body.velocity.y = JUMP_FORCE;
                jumpBufferTimer = 0;
                coyoteTimer = 0;
                stateLockTimer = JUMP_START_TIME;
                break;
            case PLAYERS_STATE.JUMP:
                break;
            case PLAYERS_STATE.LANDING:
                console.log("LANDING");
                red_rectangle.body.velocity.x = 0;
                stateLockTimer = LANDING_TIME;
                break;
        }
    }
}

function requestState(state){

    if(stateLockTimer > 0){
        console.log("State locked :", stateLockTimer);
        return playerState;
    }

    switch(state){
        case PLAYERS_STATE.JUMP_START :
            if(jumpBufferTimer > 0 && coyoteTimer > 0)
                return state;
            break;
        case PLAYERS_STATE.WALK :
            direction = walk ? 1 : backWalk ? -1 : 0;
            if(direction !== 0)
                return state;
            break;
        case PLAYERS_STATE.IDLE :
            direction = walk ? 1 : backWalk ? -1 : 0;
            if(direction === 0)
                return state;
            break;
    }   

    return playerState;
}