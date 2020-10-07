const mongoose = require('mongoose')

const taskSchema=new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        default: false,
        type: Boolean
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'users'
    }
},{
    timestamps:true
})
const Task = mongoose.model('tasks',taskSchema )

module.exports = Task