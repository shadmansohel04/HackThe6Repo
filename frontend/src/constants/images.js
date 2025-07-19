// QUEEN
import QueenIdle from "../assets/players/queen/Idle.png"
import QueenDeath from "../assets/players/queen/Death.png"
import QueenAttack from "../assets/players/queen/Attack.png"


// MEDIVAL
import medivalIdle from "../assets/players/medival1/Idle.png"
import medivalDeath from "../assets/players/medival1/Death.png"
import medivalAttack from "../assets/players/medival1/Attack.png"
import medivalRun from "../assets/players/medival1/Run.png"


export const queen = {
    idle: {
        source: QueenIdle,
        framesMax: 8,
        framesHold: 5,
    },
    // Death: QueenDeath,
    attack: {
        source: QueenAttack,
        framesMax: 8,
        framesHold: 2
    }
}

export const medival = {
    idle: {
        source: medivalIdle,
        framesMax: 6,
        framesHold: 5,
    },
    // Death: medivalDeath,
    run:{
        source: medivalRun,
        framesMax: 8,
        framesHold: 2
    },
    attack: {
        source: medivalAttack,
        framesMax: 4,
        framesHold: 3
    }
}