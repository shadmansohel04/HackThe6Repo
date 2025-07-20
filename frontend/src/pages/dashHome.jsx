import { useNavigate } from "react-router-dom"
import "../styles/gamePage.css"
import { useAuth0 } from "@auth0/auth0-react";
import P1 from "../assets/players/P1.gif"
import P2 from "../assets/players/P2.gif"

export default function GameComp(){
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth0();

    
    if(!isAuthenticated){
        return(
            <div>
                <h1>Please log in</h1>
            </div>
        )
    }

    return(
        <>
            <div className="gamePage">
                <div style={{position: 'absolute', width: '100%', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}/>
                <div className="left">
                    <h1>Welcome {user.name}</h1>
                    <img className="player1" src={P1} alt="player1" />
                </div>
                <div className="right">
                    <img className="player2" src={P2} alt="player2" />
                    <button onClick={()=>{navigate("/pregame")}} className="joinButton">
                        To Battle
                    </button>
                </div>
                <button onClick={()=>{navigate("/cameraPage")}} className="joinButton leftSide">
                    Upload
                </button>
            </div>

        </>
    )
}
