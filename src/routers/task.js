const express=require('express')
const Task=require('../models/task')
const auth=require('../middleware/auth')

const router=new express.Router()

router.post('/tasks',auth,async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

//Get /tasks?completed=true
router.get('/tasks',auth,async (req, res) => {
    const match={}
    const sort = {}
    if(req.query.completed){ //this is a string here to check if it exists or not
        match.completed = req.query.completed ==='true'

    }
    if(req.query.sortby){
        const parts=req.query.sortby.split('_') //any symbol can be used
        sort[parts[0]]= parts[1]==='desc' ? -1 : 1 //-1 for desc and 1 for asc
    }
    try{
        //const task=await Task.find({owner:req.user._id})
        //res.send(task)
        //The above is an alternate approach
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send()
    }
})
router.get('/tasks/:id',auth,async (req, res) => {
    const _id = req.params.id
    try{
        //const task=await Task.findById(_id)
        const task=await Task.findOne({_id, owner:req.user._id})
        if (!task) { 
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send()
    }

})


router.patch('/tasks/:id',auth,async (req,res)=>{
    const updates=Object.keys(req.body)
    const validUpdates=['description','completed']
    const isValidUpdate = updates.every((update)=>{
        return validUpdates.includes(update)
    })
    if(!isValidUpdate){
        return res.status(400).send({error: 'Invalid Update'})
    }
    const _id =req.params.id
    try{
        //const task=await Task.findById(_id)
        const task=await Task.findOne({_id,owner:req.user._id})
        if(!task){
            return res.status(400).send()
        }
        updates.forEach((update)=>{
            task[update]=req.body[update]
        })
        task.save()
        //const task=await Task.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
        
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})


router.delete('/tasks/:id',auth,async (req,res)=>{
    const _id=req.params.id
    try{
        const task=await Task.findOneAndDelete({_id,owner:req.user._id})
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router