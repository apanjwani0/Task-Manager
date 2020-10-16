const request = require('supertest')
const User=require('../../src/models/user')
const jwt =require('jsonwebtoken')
const mongoose=require('mongoose')
const Task=require('../../src/models/task')

//validUserOne => to test logged in user 
//validUserTwo => to test logged in user -2 
//validUserThree=> to test signup process
//invalidUserOne => to test not logging non-existent user

//taskOne => Task one of valid user one
//taskTwo => Task two of valid user one
//taskThree => Task one of valid user two

const validUserOneID=new mongoose.Types.ObjectId()
const validUserOne={
    _id:validUserOneID,
    email:'aman@abc.com',
    password:'12345678',
    name:'Charles',
    tokens:[{
        token:jwt.sign({_id:validUserOneID},process.env.secretString)
    }]
}

const validUserTwoID=new mongoose.Types.ObjectId()
const validUserTwo={
    _id:validUserTwoID,
    email:'aman@xyz.com',
    password:'12345678',
    name:'Holt',
    tokens:[{
        token:jwt.sign({_id:validUserTwoID},process.env.secretString)
    }]
}
const validUserThree={
    email:'apanjwani0@gmail.com',
    password:'12345678',
    name:'Aman'
}
const invalidUserOne={
    email:'apanjwani0@gmail.com',
    password:'12341234', //wrong pass
    name:'Jake'
}

const taskOne={
    description:'Task one of valid User one',
    completed: true,
    _id: new mongoose.Types.ObjectId(),
    owner:validUserOneID
}
const taskTwo={
    description:'Task two of valid User one',
    completed: false,
    _id: new mongoose.Types.ObjectId(),
    owner:validUserOneID
}
const taskThree={
    description:'Task one of valid User two',
    completed: true,
    _id: new mongoose.Types.ObjectId(),
    owner:validUserTwoID
}

const setupDB=async ()=>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(validUserOne).save()
    await new User(validUserTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports={
    validUserOneID,
    validUserOne,
    validUserTwo,
    validUserThree,
    invalidUserOne,
    setupDB,
    taskOne
}