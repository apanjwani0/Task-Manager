User=require('../models/user')
jwt=require('jsonwebtoken')

const auth=async (req,res,next)=>{
    try{
        const token=req.header('Authorization').replace('Bearer ','')
        //console.log(token)
        const decoded=jwt.verify(token,process.env.secretString)
        //console.log(decoded._id)
        const user=await User.findOne({_id:decoded._id,'tokens.token':token})
        //console.log(user)
        if(!user){
            throw new Error()
        }
        req.token=token
        req.user=user
        next()
    }catch(e){
        res.status(401).send('Please Authenticate.')
    }
    //next()
}

module.exports=auth