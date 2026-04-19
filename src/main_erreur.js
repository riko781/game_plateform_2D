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
    let wantedState = false;

    //read input
    const walk = dKeyObject.isDown;
    const backWalk = qKeyObject.isDown;
    const upJustDown = Phaser.Input.Keyboard.JustDown(spaceKeyObject);
    const upJustUp = Phaser.Input.Keyboard.JustUp(spaceKeyObject);
    direction = walk ? 1 : backWalk ? -1 : 0;

    stateLockTimer = Math.max(0, stateLockTimer - delta);

    //initializations Timers
    //Jump Buffering
    if(upJustDown){
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
    //Landing detection
    if(wantedState === false && !wasGrounded && red_rectangle.body.blocked.down){
        wantedState = PLAYERS_STATE.LANDING;
    }

    if(wantedState === false && upJustUp && red_rectangle.body.velocity.y < 0){
        wantedState = PLAYERS_STATE.FALL;
    }

    //state update

    //Jump feel
    if(wantedState === false && jumpBufferTimer > 0 && coyoteTimer > 0){
        wantedState = PLAYERS_STATE.JUMP_START;
    }

    if(wantedState === false && !red_rectangle.body.blocked.down && red_rectangle.body.velocity.y < 0){
        wantedState = PLAYERS_STATE.JUMP;
    }

    //horizontal movement
    if(wantedState === false && direction !== 0){
        wantedState = PLAYERS_STATE.WALK;
        const controle = red_rectangle.body.blocked.down ? 1: AIR_CONTROL_MULTIPLIER;
        red_rectangle.body.velocity.x = direction * SPEED * controle;
    }
    
    if(wantedState === false && direction === 0){
        wantedState = PLAYERS_STATE.IDLE;
        red_rectangle.body.velocity.x = 0;
    }

    if(wantedState !== false){
        console.log("WantedState :", wantedState);
        playerState = requestState(wantedState);
        console.log("PlayerState :", playerState);
        console.log("PreviousState :", previousState);
        console.log("------------");

        switch(playerState){
            case PLAYERS_STATE.JUMP_START:
                jumpBufferTimer = 0;
                coyoteTimer = 0;
                red_rectangle.body.velocity.y = JUMP_FORCE;
                stateLockTimer = JUMP_START_TIME;
                break;
            case PLAYERS_STATE.LANDING:
                stateLockTimer = LANDING_TIME;
                break;
            case PLAYERS_STATE.FALL:
                //increase fall speed
                red_rectangle.body.velocity.y *= 0.5;
                break;
                
                break;
        }
    }

    //state movement 
    if(previousState !== playerState)
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

    wasGrounded = red_rectangle.body.blocked.down;
    previousState = playerState;
}

function requestState(state){

    if(stateLockTimer > 0){
        return playerState;
    }

    switch(state){
        case PLAYERS_STATE.HANDLING :
            if(!wasGrounded && red_rectangle.body.blocked.down)
                return state;
            break;
        case PLAYERS_STATE.JUMP :
            if(!red_rectangle.body.blocked.down && red_rectangle.body.velocity.y < 0)
                return state;
            break;
        case PLAYERS_STATE.JUMP_START :
            if(jumpBufferTimer > 0 && coyoteTimer > 0)
                return state;
            break;
        case PLAYERS_STATE.FALL :
            if(!red_rectangle.body.blocked.down && red_rectangle.body.velocity.y > 0)
                return state;
            break;
        case PLAYERS_STATE.WALK :
            if(direction !== 0)
                return state;
            break;
        case PLAYERS_STATE.IDLE :
            if(direction === 0)
                return state;
            break;
    }   

    return playerState;
}