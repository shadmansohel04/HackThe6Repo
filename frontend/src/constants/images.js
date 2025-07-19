// QUEEN
import QueenIdle from "../assets/players/queen/Idle.png"
import QueenDeath from "../assets/players/queen/Death.png"
import QueenAttack from "../assets/players/queen/Attack.png"
import QueenRun from "../assets/players/queen/Run.png"
import QueenJump from "../assets/players/queen/Jump.png"


// MEDIVAL
import medivalIdle from "../assets/players/medival1/Idle.png"
import medivalDeath from "../assets/players/medival1/Death.png"
import medivalAttack from "../assets/players/medival1/Attack.png"
import medivalRun from "../assets/players/medival1/Run.png"
import medivalJump from "../assets/players/medival1/Jump.png"


export const queen = {
    idle: {
        source: QueenIdle,
        framesMax: 8,
        framesHold: 5,
    },
    run:{
        source: QueenRun,
        framesMax: 8,
        framesHold: 3,
    },
    attack: {
        source: QueenAttack,
        framesMax: 4,
        framesHold: 2,
        hitbox: 160
    },
    jump: {
        source: QueenJump,
        framesMax: 2,
        framesHold: 5
    }
}

export const medival = {
    idle: {
        source: medivalIdle,
        framesMax: 6,
        framesHold: 5,
    },
    run:{
        source: medivalRun,
        framesMax: 8,
        framesHold: 5
    },
    attack: {
        source: medivalAttack,
        framesMax: 4,
        framesHold: 6,
        hitbox: 150
    },
    jump:{
        source: medivalJump,
        framesMax: 2,
        framesHold: 5
    }
}