const express = require("express");
const { Address } = require("../Models/addressModel");
const { User } = require("../Models/userModel");


const router = express.Router();


router.post('/create/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const { name,district, city, state, country, postalCode } = req.body;

        // Create a new address
        const newAddress = await Address.create({
            name,
            district,
            city,
            state,
            country,
            postalCode,
            user: mongoose.Types.ObjectId(userId)
        });

        // Add the new address to the user's addresses array
        await User.findByIdAndUpdate(userId, { $push: { addresses: newAddress._id } });

        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get("/get/:id",async(req,res)=>{
    const userId = req.params.id;
    try {
       const user = await User.findById(userId).populate("addresses");
       if(!user){
        res.status(400).json({message:"Data not found"})
       }
       res.status(200).json({message:"Data found successfully"})
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