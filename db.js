const mongoose = require('mongoose');


const databaseConnection = async()=>{
    const params = {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }
    try {
        mongoose.connect(process.env.MONGO_URL,params)
        console.log("mongodb connected successfully")
    } catch (error) {
        console.log('mongodb error',error)
    }
}

const dbConnection = databaseConnection

module.exports = {dbConnection}
