export class Enemy{
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