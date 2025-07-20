import "../styles/preGamePage.css";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function PregameComp() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [selected, setSelected] = useState(-1);
  const [recipeData, setRecipeData] = useState([]);
  const nav = useNavigate()

  useEffect(() => {
    const fetcher = async () => {
      try {
        const token = await getAccessTokenSilently();
        const raw = await fetch("http://10.33.41.210:8000/home/getRecipes", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const response = await raw.json();
        if (response && response.recipes) {
            if(response.recipes.length == 0){
                nav("/game")
            }
            setRecipeData(response.recipes);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetcher();
  }, []);

  const deleter = async(personID, foodURL)=>{
    try {
        const token = await getAccessTokenSilently();
        const raw = await fetch("http://10.33.41.210:8000/home/deleteRecipe",{
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body:JSON.stringify({
                personID,
                foodURL
            })
        })
        const response = await raw.json()
    } catch (error) {
        console.log(error)
    } 
  }

  return (
    <>
        <button style={{position: 'absolute', left: '10px', top: '10px'}} onClick={()=>{
            nav("/userDash")
        }}>Back</button>
        <button onClick={()=>{
            if(selected < 0){
                nav("/game")
            }
            else{
                nav("/game",{state:{
                    healthBoost: recipeData[selected].health,
                    speedBoost: recipeData[selected].speed,
                    jumpBoost: recipeData[selected].jump
                }})
                deleter(recipeData[selected].personID, recipeData[selected].foodURL)
            }
        }} style={{position: 'absolute', top: '10px', right: '10px'}}>{selected < 0? "Skip selection": "Confirm"}</button>
        <div className="pregamePage">
        <h1 style={{color: 'white'}}>Choose One Food Item</h1>
        <ul className="carousel">
            {recipeData.map((each, index) => {
            return (
                <li key={index}>
                <div
                    onClick={() => {
                    if (selected === index) {
                        setSelected(-1);
                    } else {
                        setSelected(index);
                    }
                    }}
                    style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    }}
                >
                    <h1
                    className="tint"
                    style={{
                        color: 'white',
                        position: "absolute",
                        bottom: "0px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        opacity: selected === index ? 1 : 0,
                    }}
                    >
                    Selected
                    </h1>
                    <h1
                    style={{
                        zIndex: 6,
                        padding: "15px",
                        textAlign: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        width: "100%",
                        position: "absolute",
                        top: "0px",
                        left: "50%",
                        color: 'white',
                        transform: "translateX(-50%)",
                    }}
                    >
                    {each.foodName}
                    </h1>
                    <img
                    style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                    }}
                    src={each.foodURL}
                    alt={`Slide ${index}`}
                    />
                    <div
                    className={selected === index ? "tall" : "short"}
                    style={{
                        position: "absolute",
                        bottom: "0",
                        width: "100%",
                        height: selected === index ? "100%" : "0", 
                        backgroundColor: "rgba(0, 206, 137, 0.7)",
                        transition: "height 0.3s ease-in-out",
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    >
                    {selected === index && (
                        <div
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            padding: "20px",
                            borderRadius: "20px",
                            backgroundColor: "#f7f7f7",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "12px",
                        }}
                        >
                        <h2
                            style={{
                            fontSize: "1.5rem",
                            margin: "10px 0 5px",
                            color: "black",
                            }}
                        >
                            {each.foodName}
                        </h2>
                        <p
                            style={{
                            textAlign: "center",
                            color: "#444",
                            marginBottom: "10px",
                            }}
                        >
                            {each.description}
                        </p>

                        <div
                            style={{
                            display: "flex",
                            justifyContent: "space-around",
                            width: "100%",
                            marginTop: "10px",
                            }}
                        >
                            <div style={{ textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: "1.2rem" }}>❤️</p>
                            <p style={{ margin: 0, color: "black" }}>
                                {each.health}
                            </p>
                            </div>
                            <div style={{ textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: "1.2rem" }}>🦘</p>
                            <p style={{ margin: 0, color: "black" }}>
                                {each.jump}
                            </p>
                            </div>
                            <div style={{ textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: "1.2rem" }}>⚡</p>
                            <p style={{ margin: 0, color: "black" }}>
                                {each.speed}
                            </p>
                            </div>
                        </div>
                        </div>
                    )}
                    </div>
                </div>
                </li>
            );
            })}
        </ul>
        </div>
    </>
  );
}
