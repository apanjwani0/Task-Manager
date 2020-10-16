const path=require('path')
require('dotenv').config({path: path.join(__dirname,'../config/test.env')})
const request = require('supertest')
const app =require('../src/app')
const Task=require('../src/models/task')
const {validUserOneID,validUserOne,validUserTwo,invalidUserOne,setupDB,taskOne}=require('./fixtures/db')

beforeEach(setupDB)

test('Should create task for validUserOne',async ()=>{
    const response=await request(app)
        .post('/tasks')
        .set('Authorization',`Bearer ${validUserOne.tokens[0].token}`)
        .send({
            description:'From task.test.js'
        })
        .expect(200)

    const task=await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should check tasks of validUserOne',async ()=>{
    const response=await request(app)
        .get('/tasks')
        .set('Authorization',`Bearer ${validUserOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(2)

})

test('validUserTwo should not be able to delete taskOne',async ()=>{
    const response=await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization',`Bearer ${validUserTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task=await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})