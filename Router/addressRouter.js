const express = require("express");
const { Address } = require("../Models/addressModel");


const router = express.Router();

router.post("/create/:id",async(req,res)=>{
    try {
        const existingAddress = await Address.findOne({user:req.params.id});
        if(existingAddress){
            existingAddress.address.push(req.body);
            await existingAddress.save();
            res.status(200).json({message:"Address added successfully",address:existingAddress})

        }
        const address = await Address.create({address:[req.body],user:req.params.id});
        if(!address){
            res.status(400).json({message:"Error occured"})
        }
        await address.save();
        res.status(200).json({message:"Address added successfully",address})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"})
    }
})

router.get("/get/:id",async(req,res)=>{
    try {
        const address = await Address.findOne({user:req.params.id}).populate("user","-password");
        if(!address){
            res.status(400).json({message:"Data not found"})
        }
        res.status(200).json({message:"Address found successfully",address})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"})
    }
});

router.put("/edit/:id",async(req,res)=>{
    try {
        const address = await Address.findOne({user:req.params.id});
        address.name = req.body.name || address.name;
        address.city = req.body.city || address.city;
        address.landmark = req.body.landmark || address.landmark;
        address.pincode = req.body.pincode || address.pincode;
        address.district = req.body.district || address.district;
        address.phoneNumber = req.body.phoneNumber || address.phoneNumber;

        await address.save();
        res.status(200).json({message:"Address updated successfully",address})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"})
        
    }
})

router.delete("/remove/:id",async(req,res)=>{
    try {
        const address  = await Address.findByIdAndDelete({user:req.params.id});
        if(!address){
            res.status(400).json({message:"Error occured"})
        }
        res.status(200).json({message:"Address removed successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"})
    }
})

const addressRouter = router;

module.exports = {addressRouter};