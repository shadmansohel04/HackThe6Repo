import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function UserDash() {
    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;

        console.log("isAuthenticated:", isAuthenticated);
        console.log("user:", user);

        const fetcher = async () => {
            try {
                const token = await getAccessTokenSilently({
                    audience: 'https://dev-abm2ro6war776xmm.us.auth0.com/api/v2/',
                });
                console.log(token);

                const raw = await fetch("http://10.33.41.210:8000/home/getRecipes", {
                    method: "GET",
                    headers: {
                        "Authorization": token
                    }
                });

                const response = await raw.json();
                console.log(response);
            } catch (error) {
                console.error("Failed to fetch recipes:", error);
            }
        };

        fetcher();
    }, [isLoading, isAuthenticated]);



    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <div>You are not logged in.</div>;
    }

    return (
        <div>
            <h1>Welcome, {user.name}!</h1>
        </div>
    );
}