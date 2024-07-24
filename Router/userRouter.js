const express = require('express');
const { User } = require('../Models/userModel');
const nodemailer = require('nodemailer');


const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post("/signup",async(req,res)=>{
    try {
        let user = await User.findOne({email:req.body.email});
        if(user){
            res.status(400).json({message:"User Already Exist"})
        }
        if(!req.body.email || !req.body.username || !req.body.password){
            res.status(400).json({message:"All credentials are required"})
        }
        user=new User({

        })
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server Error"})
    }
}) 