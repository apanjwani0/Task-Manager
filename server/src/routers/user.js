const express =require('express')
const router = new express.Router()
const User=require('../models/user')
const auth=require('../middleware/auth')
const { remove } = require('../models/user')
const {sendWelcomeEmail,sendGoodbyeEmail} =require('../emails/account')
const multer= require('multer')
const sharp =require('sharp')

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

const upload=multer({
    //dest:'avatars',
    limits:{
        fileSize:1000000 //1 MB , 1 mill bytes
    },
    fileFilter(req,file,cb){
        if(! file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a jpg,jpeg or png format file'))
        }
        cb(undefined,true)
    }
})

router.post('/users/profile/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width: 300,height:300}).png().toBuffer()
    req.user.avatar=buffer
    console.log(req.file.originalname,'Uploaded Successfully!')
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/profile/avatar',auth,async (req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.get('/users/profile/avatar',auth,async (req,res)=>{
    try{
        res.set('Content-Type','image/png')
        res.send(req.user.avatar)
    }catch(e){
        res.status(400).send(e)
    }

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