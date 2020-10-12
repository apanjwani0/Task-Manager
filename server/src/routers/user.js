const express =require('express')
const router = new express.Router()
const User=require('../models/user')
const auth=require('../middleware/auth')
const { ResumeToken } = require('mongodb')
const { remove } = require('../models/user')
const {sendWelcomeEmail,sendGoodbyeEmail} =require('../emails/account')

router.post('/users',async (req, res) => {
    const user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email,user.name) //sgmail returns promise we can wait if we want to
        const token=await user.generateAuthToken()
        console.log('Signup Successful')
        res.send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})


router.post('/users/login',async (req,res)=>{
    try{
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateAuthToken()
        console.log('Login Successful')
        res.send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        console.log('Logout Successful')
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        console.log('Logout of asll devices Successful !')
        res.send()
    }catch(e){
        console.status(500).send()
    }
})

router.get('/users/profile',auth,async (req, res) => {
    res.send(req.user)
})


router.get('/users/:id',async (req, res) => {
    const _id = req.params.id
    try{
        const user =await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    }catch(e){
        res.status(500).send()
    }

})


router.patch('/users/profile',auth,async (req,res)=>{
    const updates=Object.keys(req.body)
    const validUpdates=['name','email','password','age']
    const isValidUpdate = updates.every((update)=>{
        return validUpdates.includes(update)
    })
    if(!isValidUpdate){
        return res.status(400).send({error: 'Invalid Update'})
    }
    const _id =req.user._id
    try{
        //const user=await User.findById(_id)
        const user=req.user
        updates.forEach((update)=>{
            user[update]=req.body[update]
        })
        await user.save()
        //const user=await User.findByIdAndUpdate(_id,req.body,{new: true,runValidators:true})
        // if(!user){
        //     return res.staturs(400).send()
        // }
        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/profile',auth,async (req,res)=>{
    //const _id=req.user._id
    try{
        //const user=await User.findByIdAndDelete(_id)
        // if(!user){
        //     res.status(404).send()
        // }
        await req.user.remove()
        sendGoodbyeEmail(req.user.email,req.user.name)
        console.log(`${req.user.name}'s Account deleted !`)
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})


module.exports =router