import { useEffect, useRef, useState } from "react"
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants/canvasInfo"
import { Sprite, Player } from "../constants/classes"
import { keys } from "../constants/canvasInfo"
import diningImage from "../assets/diningFighter.png"
import fireSpriteImg from "../assets/fire.png"
import { queen, medival } from "../constants/images"
import { io } from "socket.io-client"

const socket = io("http://10.33.41.210:3000")

export default function CanvasComp() {
  const [enemyHealth, setEnemyHealth] = useState(100)
  const [userHealth, setUserHealth] = useState(100)
  const [gameState, setGameState] = useState(true)
  const [winner, setWinner] = useState("")
  const canvasRef = useRef(null)
  const [playerNumber, setPlayerNumber] = useState("")

  useEffect(() => {
    if (enemyHealth <= 0) {
      setGameState(false)
      setWinner("You Win!")
    } else if (userHealth <= 0) {
      setGameState(false)
      setWinner("You Lose!")
    }
  }, [enemyHealth, userHealth])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    context.fillStyle = "lightblue"
    context.fillRect(0, 0, canvas.width, canvas.height)

    const background = new Sprite({
      position: { x: -200, y: 0 },
      imageSource: diningImage,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      scaleX: 1.4,
      scaleY: 1.1,
    })

    const fireSprites = [
      new Sprite({ position: { x: 150, y: 10 }, velocity: { x: 0, y: 0 }, width: 100, height: 100, imageSource: fireSpriteImg, scaleX: 0.5, framesMax: 4, framesHold: 5 }),
      new Sprite({ position: { x: -44, y: 10 }, velocity: { x: 0, y: 0 }, width: 100, height: 100, imageSource: fireSpriteImg, scaleX: 0.5, framesMax: 4, framesHold: 5 }),
      new Sprite({ position: { x: 1055, y: 10 }, velocity: { x: 0, y: 0 }, width: 100, height: 100, imageSource: fireSpriteImg, scaleX: 0.5, framesMax: 4, framesHold: 5 }),
    ]

    let userPlayer = null
    let enemyPlayer = null

    const animate = () => {
      requestAnimationFrame(animate)
      context.fillStyle = "lightblue"
      context.fillRect(0, 0, canvas.width, canvas.height)

      background.update(context)
      fireSprites.forEach(sprite => sprite.update(context))

      if (userPlayer) {
        userPlayer.update(context)

        userPlayer.velocity.x = 0
        userPlayer.switchSprite("idle")

        if (keys.left.pressed && userPlayer.lastKey === "left") {
          userPlayer.velocity.x = -6
          userPlayer.switchSprite("run")
          userPlayer.flip = true
        } else if (keys.right.pressed && userPlayer.lastKey === "right") {
          userPlayer.velocity.x = 6
          userPlayer.switchSprite("run")
          userPlayer.flip = false
        }

        if (userPlayer.velocity.y < 0) {
          userPlayer.switchSprite("jump")
        }

        socket.emit("update-player", {
          position: userPlayer.position,
          velocity: userPlayer.velocity,
          health: userPlayer.health,
          isAttacking: userPlayer.isAttacking,
          flip: userPlayer.flip,
        })
      }

      if (enemyPlayer) {
        enemyPlayer.update(context)
      }
    }

    socket.on("init", ({ role, position }) => {
      setPlayerNumber(role)
      userPlayer = new Player({
        position: position,
        velocity: { x: 0, y: 0 },
        color: role === "player1" ? "blue" : "red",
        canvasHeight: CANVAS_HEIGHT,
        start: role === "player1" ? "left" : "right",
        attackPower: 10,
        health: 100,
        canvasWidth: CANVAS_WIDTH,
        scaleX: 2,
        scaleY: 1,
        imageSource: role === "player1" ? medival : queen,
        jump: role === "player1" ? -14 : -20,
      })
    })

    socket.on("player-joined", ({ role, position }) => {
      enemyPlayer = new Player({
        position,
        velocity: { x: 0, y: 0 },
        color: role === "player1" ? "blue" : "red",
        canvasHeight: CANVAS_HEIGHT,
        start: role === "player1" ? "left" : "right",
        attackPower: 10,
        health: 100,
        canvasWidth: CANVAS_WIDTH,
        scaleX: 2,
        scaleY: 1,
        imageSource: role === "player1" ? medival : queen,
        jump: role === "player1" ? -14 : -20,
      })
    })

    socket.on("update-opponent", ({ data }) => {
      if (!enemyPlayer) return;

      enemyPlayer.position = data.position;
      enemyPlayer.velocity = data.velocity;
      enemyPlayer.health = data.health;
      enemyPlayer.flip = data.flip;
      enemyPlayer.isAttacking = data.isAttacking;
      setEnemyHealth(data.health);

      // Handle enemy animation
      enemyPlayer.velocity.x = data.velocity.x;

      if (enemyPlayer.velocity.y < 0) {
        enemyPlayer.switchSprite("jump");
      } else if (enemyPlayer.velocity.x > 0) {
        enemyPlayer.switchSprite("run");
        enemyPlayer.flip = false;
      } else if (enemyPlayer.velocity.x < 0) {
        enemyPlayer.switchSprite("run");
        enemyPlayer.flip = true;
      } else {
        enemyPlayer.switchSprite("idle");
      }
    });

    

    socket.on("opponent-attack", ({ attackBox, enemyData }) => {
      if (!userPlayer) return;

      enemyPlayer.isAttacking = true;
      enemyPlayer.switchSprite("attack");

      const userX = userPlayer.position.x;
      const userY = userPlayer.position.y;
      const userW = userPlayer.width;
      const userH = userPlayer.height;

      const attackX = attackBox.x;
      const attackY = attackBox.y;
      const attackW = attackBox.width;
      const attackH = attackBox.height;

      const horizontallyAligned =
        (enemyData.lastKey === 'right' &&
          attackX + attackW >= userX &&
          attackX <= userX + userW) ||
        (enemyData.lastKey === 'left' &&
          attackX >= userX &&
          attackX - attackW / 2 <= userX + userW);

      const verticallyAligned =
        attackY + attackH >= userY &&
        attackY <= userY + userH;

      if (horizontallyAligned && verticallyAligned && enemyData.isAttacking) {
        console.log("You got hit!");
        userPlayer.health = Math.max(userPlayer.health - 5, 0)
        setUserHealth(userPlayer.health);
      }
    });




    animate()

    const handleKeyDown = e => {
      if (!userPlayer) return
      switch (e.key) {
        case "ArrowLeft":
          keys.left.pressed = true
          userPlayer.lastKey = "left"
          break
        case "ArrowRight":
          keys.right.pressed = true
          userPlayer.lastKey = "right"
          break
        case "ArrowUp":
          if (!userPlayer.jumping) {
            userPlayer.velocity.y = userPlayer.jump
            userPlayer.jumping = true
          }
          break
        case " ":
          userPlayer.attack()
          socket.emit("player-attack", {
            attackBox: {
              x: userPlayer.attackBox.position.x,
              y: userPlayer.attackBox.position.y,
              width: userPlayer.attackBox.width,
              height: userPlayer.attackBox.height,
            },
            userData: {
              lastKey: userPlayer.lastKey,
              isAttacking: userPlayer.isAttacking,
              position: userPlayer.position,
              width: userPlayer.width,
              height: userPlayer.height,
              attackBox: userPlayer.attackBox
            }
          })
          break
      }
    }

    const handleKeyUp = e => {
      switch (e.key) {
        case "ArrowLeft":
          keys.left.pressed = false
          break
        case "ArrowRight":
          keys.right.pressed = false
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      socket.off("init")
      socket.off("player-joined")
      socket.off("update-opponent")
      socket.off("opponent-attack")
    }
  }, [])

  if (gameState) {
    return (
      <div className="gameContainer">
        <header className="scoreBoard">
          <div><h1>{playerNumber == 'player1'? userHealth: enemyHealth}</h1></div>
          <div><h1>{playerNumber == 'player2'? userHealth: enemyHealth}</h1></div>
        </header>
        <canvas ref={canvasRef}></canvas>
      </div>
    )
  }

  return (
    <div className="gameOverScreen">
      <h1>GAME OVER</h1>
      <h2>{winner}</h2>
    </div>
  )
}
