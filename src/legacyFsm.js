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

