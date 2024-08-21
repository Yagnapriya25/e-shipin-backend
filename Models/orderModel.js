const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.ObjectId,
        ref:"User",
        required:true
    },
    items:[{
        
    }]
})