const mongoose = require('mongoose');

const addressShema = new mongoose.Schema({
    user:{
        type:mongoose.ObjectId,
        ref:"User",
        required:true
    },
    address:[{
        name:{
            type:String,        
            required:true
        },
        city:{
            type:String,
            required:true
        },
        landmark:{
            type:String,
            require:true
        },
        district:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        phoneNumber:{
            type:Number,
            required:true,
        }
    }]
  
},{timestamps:true})

const Address = mongoose.model("Address",addressShema);

module.exports = {Address}
