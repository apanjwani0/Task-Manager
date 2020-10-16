const express = require('express')
require('./db/mongoose')
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')
const app = express()

const cors =require('cors')

app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


module.exports=app