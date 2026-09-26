export class Levier {
    scene;
    levelObjectLayer;
    id;
    x;
    y;
    width;
    height;
    activated = false;
    sprite;

    constructor(scene,levelObjectLayer) {
        this.scene = scene;
        this.levelObjectLayer = levelObjectLayer;
        this.id = levelObjectLayer.id;
        this.id = this.levelObjectLayer.properties.find(property => property.name === 'id')?.value;
        this.x = this.levelObjectLayer.x;
        this.y = this.levelObjectLayer.y;
        this.width = this.levelObjectLayer.width;
        this.height = this.levelObjectLayer.height;
        this.sprite = this.scene.add.sprite(levelObjectLayer.x, levelObjectLayer.y,'tilesSheet',64);

          console.log(
            `Levier ${this.id}`,
            this.x,
            this.y,
            this.width,
            this.height
        );

        this.zone = this.scene.add.rectangle(
            this.x + this.width / 2, this.y + this.height / 2, this.width, this.height
        );

        this.scene.physics.add.existing(this.zone, true);

        this.zone.setVisible(false);
    }

    activate() {
        if (this.activated) {
            return;
        }
        this.activated = true;

        console.log(`Levier ${this.id} activated`);
        console.log('Levier sprite created:', this.sprite);
        this.sprite.setFrame(66);
    }

    update(player) {
        // Logic to update the lever's state goes here
        if(this.activated) {
            // Logic to handle the lever being activated
            return;
        }

        const playerNear = this.scene.physics.world.overlap(player.sprite, this.zone);

        if(playerNear && player.hitJustDown) {
            this.activate();
        }
       
    }
}