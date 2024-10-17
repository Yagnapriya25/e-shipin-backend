const mongoose = require('mongoose');


const databaseConnection = async()=>{
  
    try {
        mongoose.connect(process.env.MONGO_URL)
        console.log("mongodb connected successfully")
    } catch (error) {
        console.log('mongodb error',error)
    }
}

const dbConnection = databaseConnection

module.exports = {dbConnection}
