const express = require('express');
const { Product } = require('../Models/productModel');
const Razorpay = require('razorpay');

const router = express.Router();

const razorpay = new Razorpay({
    key_id:"rzp_test_zVUZCNrVjLSv79",
    key_secret:process.env.payment_key
})


router.post("/create/:id/:p_id",async(req,res)=>{

    const {userId,productId}=req.params;
    try {
        let totalAmount =0;
        for (let item of productId){
            const product = await Product.findById(item.product);
            totalAmount += product.price * item.quantity
        }
        const option = {
            amount:totalAmount*100,
            currency:"INR",
            payment_capture:1

        }
     const order = await razorpay.orders.create(option);
      
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"})
    }
})


const OrderRouter = router;

module.exports = {OrderRouter}