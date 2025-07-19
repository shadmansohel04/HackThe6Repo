import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: [true, 'Please give a username']
    },
    password:{
        type: String,
        required: [true, 'Please give a password'],
        minlength: [4, 'Password must be 4 or more characters']
    },
    email:{
        type: String,
        required: [true, 'please give a email']
    },
    createdAt:{
        type: Date,
        default: Date.now()
    }
})

userSchema.pre('save', async function(next){
    if(!this.isNew){
        return next()
    }
    const emailToken = jwt.sign(
        { userId: this._id, name: this.username }, 
        process.env.JWT_SECRET, 
        {expiresIn:'1d'}
    )
    const url = `https://tmrun.onrender.com/home/confirmation/${emailToken}`

    transporter.sendMail({
        from: 'shadman2354@gmail.com',
        to: this.email,
        subject: 'Confirmation to TMRUN',
        text: `Click here to confirm your email ${url}`
    }, (error, info) => {
        if (error) {
            return next(new CustomAPIError(400, 'Proper email not given'));
        } else {
            console.log('Email sent: ' + info.response);
        }
    })

    await stravaData.create({
        person: this._id
    })

    next()
})

module.exports = mongoose.model('Users', userSchema)