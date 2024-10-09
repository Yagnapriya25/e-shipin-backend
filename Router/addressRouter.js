const express = require("express");
const { Address } = require("../Models/addressModel");
const { User } = require("../Models/userModel");


const router = express.Router();


// router.post('/create/:id', async (req, res) => {
//     const userId = req.params.id;

//     try {
//         const { name,district, city, state, country, pincode } = req.body;

//         // Create a new address
//         const newAddress = await Address.create({
//             name,
//             district,
//             city,
//             state,
//             country,
//             pincode,
//             phoneNumber,
//             user: userId
//         });

//         // Add the new address to the user's addresses array
//         await User.findByIdAndUpdate(userId, { $push: { addresses: newAddress._id } });

//         res.status(201).json(newAddress);
//     } catch (error) {
//         console.error('Error creating address:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

router.post('/create/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const { name, district, city, state, country, pincode, phoneNumber } = req.body;

        const newAddress = new Address({
            name,
            district,
            city,
            state,
            country,
            pincode,
            phoneNumber,
            user: userId // Associate the address with the user
        });

        await newAddress.save();

        // Update the user's address reference
        await User.findByIdAndUpdate(userId, { address: newAddress._id });

        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.get("/get/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        // Find the address associated with the user
        const address = await Address.findOne({ user: userId });

        // Check if the address exists
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        // Respond with the address data
        res.status(200).json({
            message: "Address found successfully",
            address
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.put("/edit/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user to ensure they exist
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the address associated with the user
        const address = await Address.findOne({ user: userId });
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        // Update the address fields based on the request body
        address.name = req.body.name || address.name;
        address.district = req.body.district || address.district;
        address.city = req.body.city || address.city;
        address.state = req.body.state || address.state;
        address.country = req.body.country || address.country;
        address.pincode = req.body.pincode || address.pincode;
        address.phoneNumber = req.body.phoneNumber || address.phoneNumber;

        // Save the updated address
        await address.save();

        res.status(200).json({ message: "Address updated successfully", address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



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