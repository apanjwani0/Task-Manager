const mongoose = require('mongoose')
const connectionURL = process.env.db_url

mongoose.connect(connectionURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:false
})


