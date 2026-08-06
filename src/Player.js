import {IdleState,DashState,RespawnState,DeadState,WinnerState,JumpState,FallState,LandingState,WalkState } from './state/StateMachine';
import {CoreTiming,SPEED,RunMetric} from './core/GameplayConstants';

export class Player{
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
    nextLevel;

    constructor(scene,nextLevel){
        this.nextLevel = nextLevel;
        this.scene = scene;
        //world bounds
        scene.physics.world.setBounds(0, 0, 3000, 600);

        //game objects
        
        this.sprite = scene.physics.add.sprite(100, 100, 'player');
        this.sprite.setOrigin(0.5, 46 / 64);

        //hitbox colision autour du player
        this.sprite.body.setSize(18, 32);
        this.sprite.body.setOffset(22,15);

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
        //this.updateDebugText(delta);
       // this.debugGraphics.clear();
        this.debugGraphics.lineStyle(2, this.isGrounded ? 0x00ff00 : 0xff0000);
        this.debugGraphics.strokeRect(this.sprite.body.x, this.sprite.body.y, this.sprite.body.width, this.sprite.body.height);

        if (this.landingFlashTimer > 0) {
            const progress =
                this.landingFlashTimer / this.landingFlashDuration;

            const radius = 20 * (1 - progress);

            /*this.debugGraphics.lineStyle(
                2,
                0xffff00,
                progress
            );*/

            this.debugGraphics.strokeCircle(
                this.sprite.body.center.x,
                this.sprite.body.bottom,
                radius
            );
        }

        const centerX = this.sprite.body.center.x;
        const centerY = this.sprite.body.center.y;
        //this.debugGraphics.lineStyle(2, 0x00ffff);
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