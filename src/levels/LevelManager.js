import { CreateLevel1 } from "./Level1";
import { CreateLevel2 } from "./Level2";
import { CreateLevel3 } from "./Level3";

let currentLevel = 0;
export let level;

const levels = [
    CreateLevel1,
    CreateLevel2,
    CreateLevel3
];

export function nextLevel(scene){
    currentLevel++;

    if(currentLevel >= levels.length){
        console.log("GAME FINISHED");
        currentLevel = 0 ;
    }

    scene.scene.restart();
}

export function loadCurrentLevel(scene,player,enemy){
    level = levels[currentLevel](scene,player,enemy);
}