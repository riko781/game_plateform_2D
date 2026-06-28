import { CreateLevel1 } from "./../levels/Level1";
import { CreateLevel2 } from "./../levels/Level2";
import { Player } from './../Player.js';

export const CoreTiming = {
    movement:{
        coyote: 120, //ms
        jumpBuffer: 100, //ms
        dashDuration: 180, //ms
        landing: 60, //ms
        timeToApex: 0.28, //ms, temps moyen pour atteindre le point le plus haut d'un saut, utilisé pour le jump cut
    },
    
    combat:{
        hitdeath: 600, //ms
    },

    game:{
        winDelay: 1500, //ms
    }

}

export const JUMP_HEIGHT = 130;
export const GRAVITY = (JUMP_HEIGHT * 2) / (CoreTiming.movement.timeToApex * CoreTiming.movement.timeToApex); // calcul de la gravité pour atteindre la hauteur de saut désirée en un temps donné
export const JUMP_FORCE = -GRAVITY * CoreTiming.movement.timeToApex; // calcul de la force de saut nécessaire pour atteindre la hauteur désirée
export const SPEED = 140;
export const DASH_SPEED = 380;
export const AIR_CONTROL_MULTIPLIER = 0.45;
export const JUMP_CUT_MULTIPLIER = 0.35;

const levels = [
    CreateLevel1,
    CreateLevel2,
]

export const RunMetric = {
    deaths : 0,
    attempts : 0,
    levelStartTime : 0
}

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