import { useEffect, useRef, useState } from "react"
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants/canvasInfo"
import { Sprite, Player } from "../constants/classes"
import { keys } from "../constants/canvasInfo"
import diningImage from "../assets/diningFighter.png"
import fireSpriteImg from "../assets/fire.png"
import { queen, medival } from "../constants/images"

export default function CanvasComp(){
    const [enemyHealth, setEnemyHealth] = useState(100)
    const [userHealth, setUserHealth] = useState(100)
    const [gameState, setGameState] = useState(true)
    const [winner, setWinner] = useState("")

    const canvasRef = useRef(null)

    useEffect(()=>{
        if(enemyHealth <= 0){
            setGameState(false)
            setWinner("Player1")
        }
        else if(userHealth <= 0){
            setGameState(false)
            setWinner('Player2')
        }
    }, [enemyHealth, userHealth])

    useEffect(()=>{
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        canvas.width = CANVAS_WIDTH
        canvas.height = CANVAS_HEIGHT

        context.fillStyle = "lightblue"
        context.fillRect(0, 0, canvas.width, canvas.height)
       
        const background = new Sprite({
            position: {
                x: -200,
                y: 0
            },
            imageSource: diningImage,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            scaleX: 1.4,
            scaleY: 1.1,
            
            // framesMax: 100
        })

        const fireSprite1 = new Sprite({
            position: {x: 150, y: 10},
            velocity: {x: 0, y: 0},
            width: 100,
            height: 100,
            imageSource: fireSpriteImg,
            scaleX: 0.5,
            framesMax: 4,
            framesHold: 5
        })

        const fireSprite2 = new Sprite({
            position: {x: -44, y: 10},
            velocity: {x: 0, y: 0},
            width: 100,
            height: 100,
            imageSource: fireSpriteImg,
            scaleX: 0.5,
            framesMax: 4,
            framesHold: 5
        })

        const fireSprite3 = new Sprite({
            position: {x: 1055, y: 10},
            velocity: {x: 0, y: 0},
            width: 100,
            height: 100,
            imageSource: fireSpriteImg,
            scaleX: 0.5,
            framesMax: 4,
            framesHold: 5
        })

        const enemy = new Player({
            position: { x: 800, y: 200 },
            velocity: { x: 0, y: 0 },
            color: 'red',
            canvasHeight: CANVAS_HEIGHT,
            start: 'right',
            attackPower: 10,
            health: 100,
            canvasWidth: CANVAS_WIDTH,
            scaleX: 2,
            scaleY: 1,
            imageSource: queen,
            framesMax: 8,
            framesHold: 5,
            jump: -20,
        })

        const userPlayer = new Player({
            position: { x: 150, y: 200 },
            velocity: { x: 0, y: 0 },
            color: 'blue',
            canvasHeight: CANVAS_HEIGHT,
            start: 'left',
            attackPower: 10,
            health: 100,
            canvasWidth: CANVAS_WIDTH,
            scaleX: 2,
            scaleY: 1,
            imageSource: medival,
            jump: -14
        })

        function animate(){
            window.requestAnimationFrame(animate)
            context.fillStyle = "lightblue"
            context.fillRect(0, 0, canvas.width, canvas.height)
            background.update(context)
            fireSprite1.update(context)
            fireSprite2.update(context)
            fireSprite3.update(context)

            // ADD ENEMY IN HERE LATER

            userPlayer.update(context)
            enemy.update(context)
            userPlayer.velocity.x = 0

            userPlayer.switchSprite('idle')

            if(keys.left.pressed && userPlayer.lastKey == 'left'){
                userPlayer.velocity.x = -6
                userPlayer.switchSprite('run')
                userPlayer.flip = true
            }
            else if(keys.right.pressed && userPlayer.lastKey == 'right'){
                userPlayer.velocity.x = 6
                userPlayer.switchSprite('run')
                userPlayer.flip = false
            }

            if(userPlayer.velocity.y < 0){
                userPlayer.switchSprite('jump')
            }


            // DO THE SAME WITH ENEMY ONCE YOU LOAD THE ENEMY IN HOW TF WE GONNA DO WEBSOCKETS

            // MONSTER IF MAKE BETTER LATER
            if (
            (
                userPlayer.lastKey === 'right' &&
                userPlayer.attackBox.position.x + userPlayer.attackBox.width >= enemy.position.x &&
                userPlayer.attackBox.position.x <= enemy.position.x + enemy.width
            ) ||
            (
                userPlayer.lastKey === 'left' &&
                userPlayer.attackBox.position.x >= enemy.position.x &&
                userPlayer.attackBox.position.x - userPlayer.attackBox.width /2 <= enemy.position.x + enemy.width
            )
            ) {
                if (
                    userPlayer.attackBox.position.y + userPlayer.attackBox.height >= enemy.position.y &&
                    userPlayer.attackBox.position.y <= enemy.position.y + enemy.height &&
                    userPlayer.isAttacking
                ) {
                    console.log("Hit!")
                    userPlayer.isAttacking = false
                    enemy.health -= 5
                    setEnemyHealth(enemy.health)
                }
            }

        }

        animate()
        
        window.addEventListener('keydown', (event)=>{
            switch(event.key){
                case 'ArrowLeft':
                    keys.left.pressed= true
                    userPlayer.lastKey = 'left'
                    break
                case 'ArrowRight':
                    keys.right.pressed = true
                    userPlayer.lastKey = 'right'
                    break
                case 'ArrowUp':
                    if(!userPlayer.jumping){
                        userPlayer.velocity.y = userPlayer.jump
                        userPlayer.jumping = true
                    }
                    break
                case ' ':
                    userPlayer.attack()
                    break
            }
        })

        window.addEventListener('keyup', (event)=>{
            switch(event.key){
                case 'ArrowLeft':
                    keys.left.pressed = false
                break
                case 'ArrowRight':
                    keys.right.pressed = false
                break
            }
        })

    },[])

    if(gameState){
        return(
            <div className="gameContainer">
                <header className="scoreBoard">
                    <div>
                        <h1>{userHealth}</h1>
                    </div>
                    <div>
                        <h1>{enemyHealth}</h1>
                    </div>
                </header>

                <canvas
                    ref={canvasRef}
                >

                </canvas>
            </div>
        )
    }
    else{
        return(
            <div>
                <h1>GAME OVER</h1>
            </div>
        )
    }

}