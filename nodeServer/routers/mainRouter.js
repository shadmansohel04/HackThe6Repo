import e from "express"
import { createFood } from "../controllers/preGame.js"
import { checkAuthorization } from "../middleware/auth.js"


const mainRouter = e.Router()

mainRouter.route('/uploadFood').post(checkAuthorization, createFood)
mainRouter.route('/getRecipes').get(checkAuthorization, createFood)

export {mainRouter}