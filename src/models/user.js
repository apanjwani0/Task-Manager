const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt =require('bcrypt')
const jwt = require('jsonwebtoken')
const Task=require('./task')

const userSchema=mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age cannot be negative')
            }
        }
    },
    email: {
        type: String,
        unique:true,
        required: true,
        toLowerCase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email')
            }
        }
    },
    password: {
        required: true,
        type: String,
        trim: true,
        minlength: 7,
        validate(value) {
            //console.log(value.toLowerCase().includes('password'))
            if (value.toLowerCase().includes('password')) {
                throw new Error('The password cannot contain "password" in it.')
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
}, {
    timestamps : true
})

userSchema.virtual('tasks',{
    ref:'tasks',
    localField:'_id',
    foreignField:'owner'
})

userSchema.pre('save',async function (next){
    const user=this
    if(user.isModified('password')){
        //console.log('Hashing')
        user.password=await bcrypt.hash(user.password,8)
    }
    next()
})

userSchema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({owner:user._id})
    next()
})

userSchema.methods.generateAuthToken=async function(){
    const user=this
    //console.log(user)
    const token=jwt.sign({_id: user._id.toString() },process.env.secretString)
    //console.log(token)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.toJSON=function(){
    const user=this
    const userObject =user.toObject()
    delete userObject.password
    delete userObject.__v
    delete userObject.tokens
    return userObject
}

userSchema.statics.findByCredentials=async (email,password)=>{

    const user=await User.findOne({email})
    if(!user){
        console.log('Unable to find User with this email')
        throw new Error('Unable to Login')
    }
    //console.log(user)
    const isMatch=await bcrypt.compare(password, user.password)
    //console.log(isMatch)
    if(!isMatch){
        console.log('Password do not match')
        throw new Error('Unable to Login')
    }
    return user
}

const User = mongoose.model('users',userSchema)

module.exports = User