const express = require("express");
const { User } = require("../Models/userModel");
const { Cart } = require("../Models/cartModel");

const router = express.Router();


router.post("/create/:id/:p_id",async(req,res)=>{
    try {
        const cart = await Cart.findOne({user:req.params.id});
        if(cart){
            
        }

    } catch (error) {
     console.log(error);
     res.status(500).json({message:"Internal server error"})   
    }
})

const cartRouter = router;

module.exports = {cartRouter};