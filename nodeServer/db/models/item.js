import mongoose from 'mongoose'


const RecipeSchema = new mongoose.Schema({
    foodName:{
        type: String,
        required: [true, 'Please give a name']
    },
    foodURL:{
        type: String,
        required: [true, 'Please give a imageURL']
    },
    personID:{
        type: String,
        required: [true, 'Please give a password'],
        minlength: [4, 'Password must be 4 or more characters']
    },
    description:{
        type: String,
        required: [true, 'Please give a description']
    },
    health:{
        type: Number,
        required: [true, 'Please give a health boost']
    },
    jump:{
        type: Number,
        required: [true, 'Please give a jump boost']
    },
    speed:{
        type: Number,
        required: [true, 'Please give a speed boost']
    },
    
})

export default mongoose.model('Recipe', RecipeSchema);