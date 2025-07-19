import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function UserDash() {
    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;

        console.log("isAuthenticated:", isAuthenticated);
        console.log("user:", user.sub);

        const fetcher = async () => {
            try {
                const token = await getAccessTokenSilently()
                const raw = await fetch("http://10.33.41.210:8000/home/getRecipes", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                console.log(`Bearer ${token}`)
                const response = await raw.json();
            } catch (error) {
                console.error("Failed to fetch recipes:", error);
            }
        };

        fetcher();
    }, [isLoading, isAuthenticated]);

    if (!isAuthenticated) {
        return <div>...</div>;
    }

    return (
        <div>
            <h1>Welcome, {user.name}!</h1>
            <button onClick={()=>{
                navigate("/game",{state:{
                    healthBoost: 10,
                    speedBoost: 10,
                    jumpBoost: 10
                }})
            }}>LETS PLAY</button>
        </div>
    );
}