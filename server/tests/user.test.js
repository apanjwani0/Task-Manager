const path=require('path')
require('dotenv').config({path: path.join(__dirname,'../config/test.env')})
const request = require('supertest')
const app =require('../src/app')
const User=require('../src/models/user')
const {validUserOneID,validUserOne,validUserThree,invalidUserOne,setupDB}=require('./fixtures/db')


beforeEach(setupDB)

test('Should signup a valid user',async ()=>{
    const response=await request(app)
        .post('/users')
        .send(validUserThree)
        .expect(200)
    
    //Assert that data was inserted correctly
    const user =await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about response
    expect(response.body).toMatchObject({
        user:{
            email:validUserThree.email,
            name:validUserThree.name
        }
    })

    //Assert that password is hashed
    expect(user.password).not.toBe(validUserThree.password)

})

test('Should login a valid user',async ()=>{
    const response=await request(app).post('/users/login').send({
        email:validUserOne.email,
        password:validUserOne.password
    }).expect(200)

    const user=await User.findById(response.body.user._id)

    //Assert that token is inserted correctly
    expect(user.tokens[1].token).toBe(response.body.token)

})

test('Should not login non-existent User',async ()=>{
    await request(app).post('/users/login').send({
        email:invalidUserOne.email,
        password:invalidUserOne.password
    }).expect(400)
})

test('Should get profile for user',async()=>{
    await request(app)
    .get('/users/profile')
    .set('Authorization',`Bearer ${validUserOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthorized user',async()=>{
    await request(app)
    .get('/users/profile')
    .send()
    .expect(401)
})

test('Should delete authorized user',async()=>{
    await request(app)
    .delete('/users/profile')
    .set('Authorization',`Bearer ${validUserOne.tokens[0].token}`)
    .send({
        email:validUserOne.email,
        password:validUserOne.password
    })
    .expect(200)

    //Assert that user is deleted
    const user=await User.findById(validUserOneID)
    expect(user).toBeNull()
})

test('Should not delete unauthorized user',async()=>{
    await request(app)
    .delete('/users/profile')
    .send({
        email:validUserOne.email,
        password:validUserOne.password
    })
    .expect(401)
})

test('Should Upload Profile Pic',async()=>{
    await request(app).post('/users/profile/avatar')
        .set('Authorization',`Bearer ${validUserOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)
    
    const user=await User.findById(validUserOneID)
    //console.log(user)
    //Assert that some Buffer gets inserted
    expect(user.avatar).toEqual(expect.any(Buffer)) 
    //toEqual compares properties of object while toBe uses ===
})

test('Should update valid user fields',async()=>{
    await request(app).patch('/users/profile')
        .set('Authorization',`Bearer ${validUserOne.tokens[0].token}`)
        .send({
            name:'Charles Boyle'
        })
        .expect(200)
    
    const user=await User.findById(validUserOneID)
    expect(user.name).toEqual('Charles Boyle')
})

test('Should not update invalid user fields',async()=>{
    await request(app).patch('/users/profile')
        .set('Authorization',`Bearer ${validUserOne.tokens[0].token}`)
        .send({
            location:'India'
        })
        .expect(400)
})