const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description1:{
        type:String,
        required:true,
        
    },
    description2:{
        type:String,
        required:true,
        
    },
    description3:{
        type:String,
        required:true,
        
    },
    images:[
       {
        image:{
            type:String,
            required:true
        }
       }
    ],
    price:{
        type:Number,
        required:true
    },
    instock:{
        type:Number,
        required:true
    },
    category:{
        ref:"Category",
        type:mongoose.ObjectId,
        required:true
    },
    user:{
        ref:"User",
        type:mongoose.ObjectId,
        required:true
    }
},
{timestamps:true}
)

const Product = mongoose.model("Product",productSchema);

module.exports = {Product}