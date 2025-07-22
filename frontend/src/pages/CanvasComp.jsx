import { useEffect, useRef, useState } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants/canvasInfo";
import { Sprite, Player } from "../constants/classes";
import { keys } from "../constants/canvasInfo";
import backgroundIMG from "../assets/background.png";
import { hoodie, hoodie2 } from "../constants/images";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function CanvasComp() {
  const location = useLocation();
  const { user } = useAuth0();
  const { healthBoost, speedBoost, jumpBoost } = location.state || {};
  const nav = useNavigate()

  const [enemyHealth, setEnemyHealth] = useState(100);
  const [userHealth, setUserHealth] = useState(100);
  const [gameState, setGameState] = useState(true);
  const [winner, setWinner] = useState("");
  const canvasRef = useRef(null);
  const [playerNumber, setPlayerNumber] = useState("");
  const flashTimer = useRef(0);
  const socket = useRef(null);
  const [enemyName, setEnemyName] = useState("Guest");
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    const tempSocket = io(`${import.meta.env.VITE_SOCKET}`, {
      auth: {
        username: user?.name || "Guest"
      }
    });
    socket.current = tempSocket;
  }, [user]);

  useEffect(() => {
    if (enemyHealth <= 0) {
      setGameState(false);
      setWinner("You Win!");
    } else if (userHealth <= 0) {
      setGameState(false);
      setWinner("You Lose!");
    }
  }, [enemyHealth, userHealth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    context.fillStyle = "lightblue";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const background = new Sprite({
      position: { x: -200, y: 0 },
      imageSource: backgroundIMG,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      scaleX: 1,
      scaleY: 1.3,
    });

    let userPlayer = null;
    let enemyPlayer = null;

    const animate = () => {
      requestAnimationFrame(animate);
      context.fillStyle = "lightblue";
      context.fillRect(0, 0, canvas.width, canvas.height);

      background.update(context);

      if (userPlayer) {
        userPlayer.update(context);

        userPlayer.velocity.x = 0;
        userPlayer.switchSprite("idle");

        if (keys.left.pressed && userPlayer.lastKey === "left") {
          userPlayer.velocity.x = speedBoost ? -6 - speedBoost : -6;
          userPlayer.switchSprite("run");
          userPlayer.flip = true;
        } else if (keys.right.pressed && userPlayer.lastKey === "right") {
          userPlayer.velocity.x = speedBoost ? 6 + speedBoost : 6;
          userPlayer.switchSprite("run");
          userPlayer.flip = false;
        }

        if (userPlayer.velocity.y < 0) {
          userPlayer.switchSprite("jump");
        }

        socket.current.emit("update-player", {
          position: userPlayer.position,
          velocity: userPlayer.velocity,
          health: userPlayer.health,
          isAttacking: userPlayer.isAttacking,
          flip: userPlayer.flip,
          attackPower: userPlayer.attackPower,
        });
      }

      if (flashTimer.current > 0) {
        const gradient = context.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          100,
          canvas.width / 2,
          canvas.height / 2,
          Math.max(canvas.width, canvas.height) / 1.2
        );

        gradient.addColorStop(0, "rgba(255, 0, 0, 0)");
        gradient.addColorStop(0.7, "rgba(255, 0, 0, 0.4)");
        gradient.addColorStop(1, "rgba(255, 0, 0, 0.5)");

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        flashTimer.current--;
      }

      if (enemyPlayer) {
        enemyPlayer.update(context);
      }
    };

    socket.current.on("init", ({ role, position }) => {
      setPlayerNumber(role);
      userPlayer = new Player({
        position: position,
        velocity: { x: 0, y: 0 },
        color: role === "player1" ? "blue" : "red",
        canvasHeight: CANVAS_HEIGHT,
        start: role === "player1" ? "left" : "right",
        attackPower: healthBoost ? 10 + healthBoost : 10,
        health: 100,
        canvasWidth: CANVAS_WIDTH,
        scaleX: 5,
        scaleY: 0.6,
        imageSource: role === "player1" ? hoodie : hoodie2,
        jump: jumpBoost ? -14 - jumpBoost : -14,
        name: user?.name || "Guest",
      });
    });

    socket.current.on("player-joined", ({ role, position, username }) => {
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
      });

      setEnemyName(username || "Guest");
      setWaiting(false);
    });

    socket.current.on("update-opponent", ({ data }) => {
      if (!enemyPlayer) return;

      enemyPlayer.position = data.position;
      enemyPlayer.velocity = data.velocity;
      enemyPlayer.health = data.health;
      enemyPlayer.flip = data.flip;
      enemyPlayer.isAttacking = data.isAttacking;
      enemyPlayer.attackPower = data.attackPower;
      setEnemyHealth(data.health);

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
        (enemyData.lastKey === "right" &&
          attackX + attackW >= userX &&
          attackX <= userX + userW) ||
        (enemyData.lastKey === "left" &&
          attackX >= userX &&
          attackX - attackW / 2 <= userX + userW);

      const verticallyAligned =
        attackY + attackH >= userY &&
        attackY <= userY + userH;

      if (horizontallyAligned && verticallyAligned && enemyData.isAttacking) {
        userPlayer.health = Math.max(
          userPlayer.health - enemyPlayer.attackPower,
          0
        );
        setUserHealth(userPlayer.health);
        flashTimer.current = 10;
      }
    });

    animate();

    const handleKeyDown = (e) => {
      if (!userPlayer) return;
      switch (e.key) {
        case "ArrowLeft":
          keys.left.pressed = true;
          userPlayer.lastKey = "left";
          break;
        case "ArrowRight":
          keys.right.pressed = true;
          userPlayer.lastKey = "right";
          break;
        case "ArrowUp":
          if (!userPlayer.jumping) {
            userPlayer.velocity.y = userPlayer.jump;
            userPlayer.jumping = true;
          }
          break;
        case " ":
          userPlayer.attack();
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
              attackBox: userPlayer.attackBox,
            },
          });
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          keys.left.pressed = false;
          break;
        case "ArrowRight":
          keys.right.pressed = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      socket.current.off("init");
      socket.current.off("player-joined");
      socket.current.off("update-opponent");
      socket.current.off("opponent-attack");
    };
  }, []);

  if (gameState) {
    return (
      <div className="gameContainer">
        <header className="scoreBoard">
          <div>
            <h2 style={{ color: "white", marginBottom: 0, fontFamily: "Pixelify Sans, sans-serif" }}>
              {playerNumber === "player1" ? (user?.name || "Guest") : enemyName}
            </h2>
            <progress
              style={{ marginTop: 0, height: "100px", width: "500px" }}
              className="nes-progress is-success"
              value={playerNumber === "player1" ? userHealth : enemyHealth}
              max="100"
            ></progress>
          </div>

          <div>
            <h2 style={{ color: "white", marginBottom: 0, fontFamily: "Pixelify Sans, sans-serif" }}>
              {playerNumber === "player2" ? (user?.name || "Guest") : enemyName}
            </h2>
            <progress
              style={{ marginTop: 0, height: "100px", width: "500px" }}
              className="nes-progress is-success"
              value={playerNumber === "player2" ? userHealth : enemyHealth}
              max="100"
            ></progress>
          </div>
        </header>

        {waiting && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: 'column',
            alignItems: "center",
            position: "absolute",
            width: "1200px",
            height: "100vh",
            zIndex: 10,
            bottom: 0,
            backgroundColor: "black"
          }}>
            <h1 style={{ color: "white", fontFamily: "Pixelify Sans, sans-serif" }}>Waiting for player2...</h1>
            <button onClick={()=>{
              nav("/userDash")
            }}>Back</button>
          </div>
        )}

        <canvas ref={canvasRef}></canvas>
      </div>
    );
  }

  return (
    <div className="gameOverScreen">
      <h1 style={{color: 'white', fontSize: '9rem', fontFamily: "Pixelify Sans, sans-serif"}}>GAME OVER</h1>
      <h2 style={{color: 'white', fontSize: '5rem', fontFamily: "Pixelify Sans, sans-serif"}}>{winner}</h2>
      <a style={{color: 'white', textDecoration: 'none'}} href="https://hackthe6repo.onrender.com/userdash">Back to the Lobby</a>
    </div>
  );
}
