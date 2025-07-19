import { useEffect } from "react";
import LoginButton from "../hooks/login"
import { useNavigate } from "react-router-dom";

export default function HomePage(){
  const navigate = useNavigate();

    return(
        <div>
            <LoginButton />
            <button onClick={()=>{
                navigate("/game")
            }}>No login</button>


        </div>
    )
}