import { useEffect } from "react";
import LoginButton from "../hooks/login";
import { useNavigate } from "react-router-dom";
import battleBites from "../assets/battleBites.png";
import backHome from "../assets/homeBack.gif";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        overflow: 'hidden',
        backgroundImage: `url(${backHome})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // gap: "3%",
        textAlign: "center",
        alignSelf: 'center'
      }}
    >
      <img
        src={battleBites}
        alt="Battle Bites Logo"
        style={{
          width: "20vw",
          filter: "drop-shadow(0 0 10px black)",
        }}
      />

      <div style={{ display: "flex", gap: "1rem" }}>
        <LoginButton />
        <button
          onClick={() => navigate("/game")}
          style={{
            backgroundColor: "#ffcc00",
            border: "none",
            padding: "2%",
            fontSize: "1.2vw",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            color: "#222",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            width: '7vw'
          }}
        >
          No Login
        </button>
      </div>
      <p style={{color: 'white'}}>Logging in gives access to power ups based on your food!</p>
    </div>
  );
}
