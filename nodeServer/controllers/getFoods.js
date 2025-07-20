import RECIPE from "../db/models/item.js"

const getFoods = async (req, res) => {
    try {
        const userID = req.user.sub

        const recipes = await RECIPE.find({
            personID: userID
        })

        return res.status(200).json({
            success: true,
            recipes
        });    
    } 
    catch (error) {
        return res.status(400).json({
            success: false,
            err: error.message
        })
    }
}

export {getFoods}