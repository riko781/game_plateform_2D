export class Enemy{
    scene;
    sprite;
    direction;
    speed;
    leftBound;
    rightBound;
    walkFrame = 0;
    frame;
    animationTimer = 0;
    numberOfFrames;

    constructor(scene, x, y,leftBound, rightBound,frame = 0,numberOfFrames = 2) {
        this.scene = scene;
        this.frame = frame;
        this.walkFrame = frame;
        this.numberOfFrames = numberOfFrames - 1;

        this.sprite = scene.physics.add.sprite(x, y, 'enemy', this.frame);
        this.sprite.setOrigin(0.5, 1);

        this.leftBound = leftBound;
        this.rightBound = rightBound;

        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);

        this.direction = -1;
        this.speed = 50;
    }

    updateAnimation(delta){
    
        this.animationTimer += delta;

        while(this.animationTimer >= 300){
            this.animationTimer -= 300;

            if(this.frame == this.walkFrame ){
                this.walkFrame++;
            }else if(this.walkFrame < this.frame + this.numberOfFrames){
                this.walkFrame++;
            }else if(this.walkFrame == this.frame + this.numberOfFrames){
                this.walkFrame = this.frame;
            }else{
                this.walkFrame--;
            }

            this.sprite.setFrame(this.walkFrame);
        }

    }

    update(delta){
        
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

        this.updateAnimation(delta);
    }

    kill (){
        this.sprite.destroy();
    }
}