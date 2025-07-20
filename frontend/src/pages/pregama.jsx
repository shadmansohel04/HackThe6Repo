import "../styles/preGamePage.css";
import battleBites from "../assets/battleBites.png"
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function PregameComp(){
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

    const [recipeData, setRecipeData] = useState([])

    useEffect(()=>{
        const fetcher = async()=>{
            try {
                const token = await getAccessTokenSilently()
                const raw = await fetch("http://10.33.41.210:8000/home/getRecipes",{
                    method: "GET",
                    headers:{
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })
                const response = await raw.json()
                if(response && response.recipes){
                    setRecipeData(response.recipes)
                }
            } catch (error) {
                console.log(error)   
            }
        }
        fetcher()

    }, [])

    return(
        <>  
            <div className ="pregamePage">
                <h1>Choose One Food Item</h1>
                <ul class="carousel">
                    {recipeData.map((each, index)=>{

                        return
                    })}
                    <li><img src={battleBites} alt="Slide 1"/></li>
                    <li><img src="./skinmatch.png" alt="Slide 2"/></li>
                    <li><img src="./TMRUN.png" alt="Slide 3"/></li>
                    <li><img src="./GAME.png" alt="Slide 4"/></li>
                    <li><img src="./leetbotpic2.png" alt="Slide 4"/></li>
                    <li><img src="./MORNING.jpg" alt="Slide 4"/></li>
                    <li><img src="./homeRate.png" alt="Slide 4"/></li>
                    <li><img src="./lesseats.png" alt="Slide 4"/></li>
                </ul>            
            </div>
        </>
    )
}