import {CoreTiming,SPEED,DASH_SPEED,GRAVITY,JUMP_FORCE,JUMP_CUT_MULTIPLIER,AIR_CONTROL_MULTIPLIER,RunMetric} from './../core/GameplayConstants';
import { nextLevel } from "./../levels/LevelManager";

export class DashState {
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

export class RespawnState {
    enter(player) {
        RunMetric.attempts ++;
        player.scene.scene.restart();
    }

    update(player) {
        return new IdleState(player);
    }
}
export class DeadState {
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

export class WinnerState {
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
            player.nextLevel(player.scene);
            //return new RespawnState(player);
        }
    }
}
export class JumpState{
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
export class FallState{
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

export class LandingState{
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

export class WalkState{
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

export class IdleState{
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