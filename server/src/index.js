const path=require('path')
require('dotenv').config({path: path.join(__dirname,'../config/dev.env')})
const app=require('./app')

const port = process.env.PORT

app.listen(port, () => {
    console.log('Server is up at port ' + port)
})
