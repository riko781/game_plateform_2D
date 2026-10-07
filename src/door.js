export class Door{
    mapLayer;
    tileset;
    scene;
    levelObjectLayer;

    orientation;
    distance;
    id;
    
    container;
    doorTiles = [];

    opened = false;
    opening = false;
    isOpen;

    constructor(scene, levelObjectLayer,mapLayer,tileset,distance) {
        this.scene = scene;
        this.levelObjectLayer = levelObjectLayer;
        this.mapLayer = mapLayer;
        this.tileset = tileset;

        this.orientation = 
            levelObjectLayer.properties
                .find(property => property.name === 'direction')?.value;
        
        this.distance = distance;

        this.id =
            levelObjectLayer.properties
                .find(property => property.name === 'id')?.value;

        this.isOpen = 
            levelObjectLayer.properties
                .find(property => property.name === 'open')?.value;

        this.container = this.scene.add.container(0, 0);
        this.createDoorSprite();

        if(this.isOpen){
            console.log(`Door ${this.id} is initially open`);
            this.disableCollisions();
        }else{
            this.enableCollisions();
        }
    }
    
    createDoorSprite() {
        const tileSize = 18;
        const startX = Math.max(0, Math.floor(this.levelObjectLayer.x / tileSize));
        const startY = Math.max(0, Math.floor(this.levelObjectLayer.y / tileSize));

        const width = Math.ceil(this.levelObjectLayer.width / tileSize);
        const height = Math.floor(this.levelObjectLayer.height / tileSize);

       // console.log("Creation de la porte :", "Start:", startX, startY, "size:", width, height);

        for(let y =0; y < height; y++){
            for(let x =0; x < width; x++){
                const tile = this.mapLayer.getTileAt(startX + x, startY + y);

                if(!tile || tile.index === -1){
                    continue;
                }
                 console.log(
                    "Tile trouvée:",
                    tile.x,
                    tile.y,
                    "index:",
                    tile.index
                );

                const worldX = tile.pixelX;
                const worldY = tile.pixelY;

                //creation du sprite de la porte
                const frame = tile.index - this.tileset.firstgid;
                /*
                console.log(
                    "Création sprite porte :",
                    "texture =", "tilesSheet",
                    "tile.index =", tile.index,
                    "firstgid =", this.tileset.firstgid,
                    "frame =", frame
                );*/
                
                const sprite = this.scene.add.sprite(worldX, worldY, 'tilesSheet',frame);
                sprite.setOrigin(0,0);
                this.container.add(sprite);
                tile.visible = false;
                this.doorTiles.push(tile);
            }
        }
        this.container.setDepth(100);
    }

    open() {
        if (this.opened || this.opening){ 
            return; 
        }

        //console.log("OPENING DOOR");

        this.opening = true;
        let targetX = this.container.x;
        let targetY = this.container.y;

         // Désactive les collisions de tous les tiles de la porte
        
        switch(this.orientation) {
            case 'up':
                targetY = this.container.y - this.distance;
                break;
            case 'down':
                targetY = this.container.y + this.distance;
                break;
            case 'left':
                targetX = this.container.x - this.distance;
                break;
            case 'right':
                targetX = this.container.x + this.distance;
                break;
            default:
                console.warn(`Direction inconnue pour la porte ${this.id}:`, this.orientation);
                break;
        }
        // Animate the door opening
        /*
        console.log("CIBLE :", {
            x: targetX ,
            y: targetY
        });*/

        this.scene.tweens.add({
            targets: this.container,
            x: targetX ,
            y: targetY ,
            duration: 500,
            ease:"Cubic.easeInOut",
            onComplete: () => {
                //console.log("DOOR OPENED");
                this.opening = false;
                this.opened = true;
            }
        });
    }

    disableCollisions() {
       // console.log("Disabling collisions for door", this.doorTiles);
        this.doorTiles.forEach(tile => {
            tile.resetCollision();
        });
    }

    enableCollisions() {
        this.doorTiles.forEach(tile => {
            tile.setCollision(true);
        });
    }

    update(){}
}