const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.ObjectId,
        ref:"User",
        required:true
    },
    items:[{
        product:{
            type:mongoose.ObjectId,
            ref:"Product",
            required:true
        },
        quantity:{
            type:Number,
            default:1,
            
        }
    }],
    totalAmount:{
        type:Number,
        required:true,
        
    },
    currency:{
        type:String,
        default:'INR'
    },
    paymentId:{
        type:String,
        required:true

    },
    orderStatus:{
        type:String,
        default:"Processign",
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    }
},{timestamps:true});

const Order = mongoose.model("Order",orderSchema);

module.exports = {Order};