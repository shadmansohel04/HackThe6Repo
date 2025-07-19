import { useEffect, useRef, useState } from "react"
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants/canvasInfo"
import { Sprite, Player } from "../constants/classes"
import { keys } from "../constants/canvasInfo"
import backgroundIMG from "../assets/background.png"
import { hoodie, hoodie2 } from "../constants/images"
import { io } from "socket.io-client"
import { useLocation } from "react-router-dom";

export default function CanvasComp() {
  const location = useLocation();
  const {healthBoost, speedBoost, jumpBoost} = location.state || {}

  const [enemyHealth, setEnemyHealth] = useState(100)
  const [userHealth, setUserHealth] = useState(healthBoost? 100 + healthBoost: 100)
  const [gameState, setGameState] = useState(true)
  const [winner, setWinner] = useState("")
  const canvasRef = useRef(null)
  const [playerNumber, setPlayerNumber] = useState("")
  const flashTimer = useRef(0)
  const socket = useRef(null)

  useEffect(()=>{
    const tempSocket = io("http://10.33.41.210:3000")
    socket.current = tempSocket
  }, [])

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
      imageSource: backgroundIMG,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      scaleX: 1,
      scaleY: 1.3,
    })


    let userPlayer = null
    let enemyPlayer = null

    const animate = () => {
      requestAnimationFrame(animate)
      context.fillStyle = "lightblue"
      context.fillRect(0, 0, canvas.width, canvas.height)

      background.update(context)

      if (userPlayer) {
        userPlayer.update(context)

        userPlayer.velocity.x = 0
        userPlayer.switchSprite("idle")

        if (keys.left.pressed && userPlayer.lastKey === "left") {
          userPlayer.velocity.x = speedBoost? -6 - speedBoost : -6
          userPlayer.switchSprite("run")
          userPlayer.flip = true
        } else if (keys.right.pressed && userPlayer.lastKey === "right") {
          userPlayer.velocity.x = speedBoost? 6 + speedBoost : 6
          userPlayer.switchSprite("run")
          userPlayer.flip = false
        }

        if (userPlayer.velocity.y < 0) {
          userPlayer.switchSprite("jump")
        }

        socket.current.emit("update-player", {
          position: userPlayer.position,
          velocity: userPlayer.velocity,
          health: userPlayer.health,
          isAttacking: userPlayer.isAttacking,
          flip: userPlayer.flip,
        })
      }

    if (flashTimer.current > 0) {
      const gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        100,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 1.2
      )

      gradient.addColorStop(0, "rgba(255, 0, 0, 0)")
      gradient.addColorStop(0.7, "rgba(255, 0, 0, 0.4)")
      gradient.addColorStop(1, "rgba(255, 0, 0, 0.5)")

      context.fillStyle = gradient
      context.fillRect(0, 0, canvas.width, canvas.height)

      flashTimer.current--
    }

      if (enemyPlayer) {
        enemyPlayer.update(context)
      }
    }

    socket.current.on("init", ({ role, position }) => {
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
        scaleX: 5,
        scaleY: 0.6,
        imageSource: role === "player1" ? hoodie : hoodie2,
        jump: jumpBoost? -14 - jumpBoost: -14,
      })
    })

    socket.current.on("player-joined", ({ role, position }) => {
      enemyPlayer = new Player({
        position,
        velocity: { x: 0, y: 0 },
        color: role === "player1" ? "blue" : "red",
        canvasHeight: CANVAS_HEIGHT,
        start: role === "player1" ? "left" : "right",
        attackPower: 10,
        health: 100,
        canvasWidth: CANVAS_WIDTH,
        scaleX: 5,
        scaleY: 0.6,
        imageSource: role === "player1" ? hoodie : hoodie2,
        jump: -14,
      })
    })

    socket.current.on("update-opponent", ({ data }) => {
      if (!enemyPlayer) return;

      enemyPlayer.position = data.position;
      enemyPlayer.velocity = data.velocity;
      enemyPlayer.health = data.health;
      enemyPlayer.flip = data.flip;
      enemyPlayer.isAttacking = data.isAttacking;
      setEnemyHealth(data.health);

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


    socket.current.on("opponent-attack", ({ attackBox, enemyData }) => {
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
        userPlayer.health = Math.max(userPlayer.health - 5, 0)
        setUserHealth(userPlayer.health);
        flashTimer.current = 10
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
          socket.current.emit("player-attack", {
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
      socket.current.off("init")
      socket.current.off("player-joined")
      socket.current.off("update-opponent")
      socket.current.off("opponent-attack")
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
