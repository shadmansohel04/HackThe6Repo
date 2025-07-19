import { useEffect, useRef } from "react"
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../../../../HackThe6/frontend/src/constants/canvas"
import { Sprite } from "../constants/classes"

export default function CanvasComp(){

    const canvasRef = useRef(null)

    useEffect(()=>{
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        canvas.width = CANVAS_WIDTH
        canvas.height = CANVAS_HEIGHT

        context.fillStyle = "lightblue"
        context.fillRect(0, 0, canvas.width, canvas.height)
       
        const background = new Sprite({
            position: {
                x: 0,
                y: 0
            },
            imageSource: 'https://img.freepik.com/free-photo/abstract-flowing-neon-wave-background_53876-101942.jpg?semt=ais_hybrid&w=740'
        })

        function animate(){
            window.requestAnimationFrame(animate)
            context.fillStyle = "lightblue"
            context.fillRect(0, 0, canvas.width, canvas.height)
            background.update(context)
        }

        animate()
    },[])

    return(
        <div>
            {/* WHERE THE HEALTH BAR WILL BE */}

            <canvas
                ref={canvasRef}
            >

            </canvas>
        </div>
    )
}