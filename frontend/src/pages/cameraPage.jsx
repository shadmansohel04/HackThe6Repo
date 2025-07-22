import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function CameraPage() {
    const { getAccessTokenSilently } = useAuth0();
    const nav = useNavigate()

    const cameraRef = useRef(null);
    const [img, setImg] = useState("");
    const [flash, setFlash] = useState(false);
    const [name, setName] = useState("");
    const [loading, setloading] = useState(false);
    const [cardData, setCardData] = useState(null);

    const handlePicture = () => {
        if(img){
            setCardData(null)
            setFlash(false)
            setImg("")
            setName("")
        }
        const screenshot = cameraRef.current.getScreenshot();
        setImg(screenshot);
        setFlash(true);
        setTimeout(() => {
            setFlash(false);
        }, 250);
    };

    const uploadFood = async () => {
        try {
            setloading(true);
            const jsonData = JSON.stringify({
                foodName: name
            });
            const base64Response = await fetch(img);
            const blob = await base64Response.blob();

            const formData = new FormData();
            formData.append("jsonData", jsonData);
            formData.append("foodImage", blob, "food.png");

            const token = await getAccessTokenSilently();
            const raw = await fetch(`${import.meta.env.VITE_BACKENDURI}/home/uploadFood`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            const response = await raw.json();
            console.log(response);
            setCardData({
                url: response.imageURL,
                details: response.details
            });
        } catch (error) {
            console.log(error);
        } finally {
            setloading(false);
        }
    };

    if (loading) {
        return (
            <div className="cameraPage" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <img
                    style={{ width: '150px', height: '150px' }}
                    src="https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif"
                    alt=""
                />
            </div>
        );
    }

    return (
        <div className="cameraPage">
            <button style={{position: 'absolute', top: '20px', right: '20px'}} onClick={()=>{nav("/userDash")}}>Back To Dash</button>

            <h1 style={{color: 'white'}}>{cardData == null ? 'Upload Your Food!' : `New card: ${cardData.details.name}`}</h1>
            <div className="row">
                <div className="cameraContainer" style={{ width: cardData == null ? '70%' : '30%' }}>
                    {cardData == null?(
                        <button
                            onClick={handlePicture}
                            style={{
                                zIndex: 10,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                bottom: '4%',
                                width: 50,
                                height: 50,
                                border: 'solid black 2px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                position: 'absolute'
                            }}
                        />
                    ):null}
                    {img === "" && cardData == null ? (
                        <Webcam
                            style={{ objectFit: 'cover' }}
                            ref={cameraRef}
                            screenshotFormat="image/png"
                            width='100%'
                            height='100%'
                            mirrored={true}
                        />
                    ) : !flash ? (
                        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', backgroundColor: 'white' }} />
                    )}
                </div>

                <div className="rightSide">
                    {cardData == null ? (
                        <>
                            <h3 style={{ marginBottom: '20px', color:'white' }}>Enter the food name</h3>
                            <input
                                value={name}
                                type="text"
                                placeholder="ex: Hamburger"
                                className="inputFood"
                                onChange={(e) => { setName(e.target.value) }}
                            />
                            {name !== "" && img !== "" ? (
                                <button onClick={uploadFood}>Submit</button>
                            ) : (
                                <button disabled={true} style={{ border: 'none', backgroundColor: 'grey', cursor: 'default' }}>
                                    Submit
                                </button>
                            )}
                        </>
                    ) : (
                        <div 
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                padding: '20px',
                                borderRadius: '20px',
                                backgroundColor: '#f7f7f7',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <h2 style={{ fontSize: '1.5rem', margin: '10px 0 5px', color: 'black' }}>{cardData.details.name}</h2>
                            <p style={{ textAlign: 'center', color: '#444' }}>{cardData.details.details}</p>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                width: '100%',
                                marginTop: '10px'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '1.2rem' }}>❤️</p>
                                    <p style={{ margin: 0,  color: 'black' }}>{cardData.details.health}</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '1.2rem' }}>🦘</p>
                                    <p style={{ margin: 0, color: 'black' }}>{cardData.details.jump}</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '1.2rem' }}>⚡</p>
                                    <p style={{ margin: 0, color: 'black' }}>{cardData.details.speed}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
