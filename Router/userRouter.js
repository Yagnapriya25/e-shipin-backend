const express = require('express');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { User, generateToken } = require('../Models/userModel');
const multer = require('multer');

dotenv.config();

const router = express.Router();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// Multer setup for file uploads
const uploads = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, "..", "uploads/users"));
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        },
    }),
});

// Temporary store for OTP
const tempOtpStore = {};

// Helper function to check for environment variable
const checkEnvVar = (varName) => {
    if (!process.env[varName]) {
        console.error(`${varName} is not set!`);
        throw new Error(`${varName} must have a value`);
    }
};

// Register route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'Please provide username, email, and password' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Generate OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const otpExpires = Date.now() + 300000; // 5 minutes

        // Send OTP email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'OTP for account verification',
            text: `Your OTP is ${generatedOtp}`,
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ msg: 'Error sending email' });
            }

            // Store OTP and expiration time
            tempOtpStore[email] = { otp: generatedOtp, otpExpires, username, email, password: hashedPassword };
            return res.status(200).json({ msg: 'OTP sent to email' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Verify OTP route
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Check if OTP exists and is valid
        const tempUser = tempOtpStore[email];
        if (!tempUser || tempUser.otp !== otp || tempUser.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        // Create new user
        const user = new User({
            username: tempUser.username,
            email: tempUser.email,
            password: tempUser.password,
        });

        await user.save();

        // Generate token
        checkEnvVar('Secret_key'); // Ensure secret key is set
        const token = jwt.sign({ id: user._id }, process.env.Secret_key, { expiresIn: '1h' });

        // Clear OTP from temporary store
        delete tempOtpStore[email];

        res.status(200).json({ msg: 'User registered successfully', token, user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All credentials are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }

        const token = generateToken(user._id);
        res.status(200).json({ message: 'Login successfully', token, user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Forget password route
router.post('/forget', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        checkEnvVar('Secret_key'); // Ensure secret key is set
        const secret = user.password + process.env.Secret_key;
        const token = jwt.sign({ _id: user._id, email: user.email }, secret, { expiresIn: '5m' });
        const link = `http://localhost:3000/reset/${user._id}/${token}`;

        const details = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Reset Password',
            text: link,
        };

        transporter.sendMail(details, (err) => {
            if (err) {
                console.log('Error occurred while sending email:', err);
                return res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent successfully');
            res.json(link);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Reset password route
router.put('/reset-password/:id/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        let userData = await User.findById(req.params.id);
        if (!userData) {
            return res.status(400).json({ message: 'User does not exist' });
        }
        if (!password) {
            return res.status(400).json({ message: 'All credentials are required' });
        }

        checkEnvVar('Secret_key'); // Ensure secret key is set
        const secret = userData.password + process.env.Secret_key;
        const verify = jwt.verify(token, secret);

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });

        res.status(200).json({ message: 'Password reset successfully', email: verify.email, status: 'verified' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get all users route
router.get('/allusers', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ message: 'Data found successfully', users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get user by ID route
router.get('/getuser/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('address');
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'Data found successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Remove user route
router.delete('/remove/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(400).json({ message: 'Error occurred while removing data' });
        }
        res.status(200).json({ message: 'Successfully removed data' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Edit user route
router.put('/edit/:id', uploads.single('avatar'), async (req, res) => {
    try {
        let avatar;
        let Base_URL = process.env.Backend_url;

        if (process.env.NODE_ENV === 'production') {
            Base_URL = `${req.protocol}://${req.get('host')}`;
        }

        if (req.file) {
            avatar = `${Base_URL}/uploads/users/${req.file.originalname}`;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { ...req.body, avatar },
            { new: true }
        );

        if (!user) {
            return res.status(400).json({ message: 'Error occurred during data update' });
        }

        res.status(200).json({ message: 'Data updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const userRouter = router;

module.exports = { userRouter };
