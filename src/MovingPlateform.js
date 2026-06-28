export class MovingPlatform {
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