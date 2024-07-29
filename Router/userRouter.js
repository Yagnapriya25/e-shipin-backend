const express = require('express');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const path = require("path");
const { User, generateToken } = require('../Models/userModel');
const multer = require('multer');

dotenv.config();

const router = express.Router()


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const uploads = multer({
    storage:multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,path.join(__dirname,"..","uploads/users"))
        },
        filename:function(req,file,cb){
            cb(null,file.originalname)
        }
    })
})

// Routes
router.post('/register', async (req, res) => {
    const { username, email, password, otp } = req.body;

    try {
        let user = await User.findOne({ email });

        if(!username || !email || !password || !otp){
            res.status(400).json({message:"All credentials are Required"})
        }
        if (!otp) {
            // Step 1: Send OTP
            if (user && !user.otp) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            const generatedOtp = generateOTP();
            const otpExpires = Date.now() + 300000; // 5mins

            if (user) {
                // User exists but registration was not completed
                user.username = username;
                user.password = await bcrypt.hash(password, 10);
                user.otp = generatedOtp;
                user.otpExpires = otpExpires;
            } else {
                // New user
                user = new User({
                    username,
                    email,
                    password: await bcrypt.hash(password, 10),
                    otp: generatedOtp,
                    otpExpires
                });
            }

            await user.save();

            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'OTP for account verification',
                text: `Your OTP is ${generatedOtp}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({ msg: 'Error sending email' });
                } else {
                    res.status(200).json({ msg: 'OTP sent to email' });
                }
            });
        } else {
            // Step 2: Verify OTP
            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            if (user.otp !== otp || user.otpExpires < Date.now()) {
                return res.status(400).json({ msg: 'Invalid or expired OTP' });
            }

            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();

            res.status(200).json({ msg: 'User registered successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post("/login",async(req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email});
        if(!req.body.email || !req.body.password){
            res.status(400).json({message:"All credentials are required"})
        }
        if(!user){
            res.status(400).json({message:"User not Exist"})
        }
        
        const comparePassword = await bcrypt.compare(req.body.password,user.password);
        if(!comparePassword){
            res.status(400).json({message:"Password Incorrect"})
        }
        const token = generateToken(user._id);
        res.status(200).json({message:"Login successfully",token,user})
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

router.post("/forget",async(req,res)=>{
    try {
        let user =  await User.findOne({email:req.body.email});
        if(!user){
            res.status(400).json({message:"User not Exists"})
        }
        if(!req.body.email){
            res.status(400).json({message:"All credentials are Required"})
        }
        const secret = user.password + process.env.Secret_key;
        const token = jwt.sign(
            {_id:user._id,email:user.email},
            secret,
            {
                expiresIn:"5m"
            }
        );
        const link = `http://localhost:3000/reset/${user._id}/${token}`
        const details = {
            from:process.env.USER,
            to:req.body.email,
            subject:"Reset Password",
            text:link
        }
        transporter.sendMail(details,(err)=>{
            if(err){
                console.log("Error occured in sending Email",err)
            }
            console.log("Email send successfully")
        });
        res.json(link);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

router.put("/reset-password/:id/:token",async(req,res)=>{
      const {token}=req.params;
      const {password}=req.body;
    try {
        let userData = await User.findOne({_id:req.params.id});
        if(!userData){
            res.status(400).json({message:"User doesnt exist"})
        }
        if(!password){
            res.status(400).json({message:"All credentials are required"})
        }
        const secret = userData.password + process.env.Secret_key;
        const verify = jwt.verify(token,secret);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const user = await User.findOneAndUpdate(
            {_id:req.params.id},
            {
                $set:{
                    password:hashedPassword,
                },
            }
        )
        res.status(200).json({message:"Password Reset Successfully", email: verify.email,
            status: "verified",user})
    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Internal Server Error'});
    }
})

router.get("/allusers",async(req,res)=>{
    try {
        const user = await User.find({});
        if(!user){
            res.status(400).json({message:"Error occured to find data"})
        }
        res.status(200).json({message:"Data found successfully",user})
    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Internal Server Error'});
    }
})

router.get("/getuser/:id",async(req,res)=>{
    try {
        const user = await User.findOne({_id:req.params.id})
        if(!user){
            res.status(400).json({message:"Data found error"})
        }
        res.status(200).json({message:"Data found successfully",user})
    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Internal Server Error'});
    }
})

router.delete("/remove/:id",async(req,res)=>{
    try {
        const user = await User.findOneAndDelete({_id:req.params.id});
        if(!user){
            res.status(400).json({message:"Data remove error"})
        }
        res.status(200).json({message:"successfully data removed"})
    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Internal Server Error'});
    }
})
router.put("/edit/:id",uploads.single("avatar"),async(req,res)=>{
    try {
        let avatar;
        let Base_URL = process.env.Backend_url;
        if(process.env.NODE_ENV==="production"){
            Base_URL=`${req.protocol}://${req.get("host")}`
        }
         if(req.file){
            avatar = `${Base_URL}/uploads/users/${req.file.originalname}`
         }
         const user = await User.findByIdAndUpdate(
            req.params.id,
            {...req.body,avatar},
            {new:true}
         )
         if(!user){
            res.status(400).json({message:"Error Occured in Data Updation"})
         }
         res.status(200).json({message:"Data Updated Successfully",user})

    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Internal Server Error'});
    }
})
const userRouter = router;

module.exports = {userRouter}