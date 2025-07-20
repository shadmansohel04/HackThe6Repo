import e from "express"
import { createFood, removeFood } from "../controllers/preGame.js"
import { getFoods } from "../controllers/getFoods.js"
import { checkAuthorization } from "../middleware/auth.js"



const mainRouter = e.Router()

mainRouter.route('/uploadFood').post(checkAuthorization, createFood)
mainRouter.route('/deleteRecipe').delete(checkAuthorization, removeFood)
mainRouter.route('/getRecipes').get(checkAuthorization, getFoods)

export {mainRouter}