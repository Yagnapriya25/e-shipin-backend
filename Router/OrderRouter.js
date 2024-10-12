const express = require('express');
const Razorpay = require('razorpay');
const { Product } = require('../Models/productModel');
const { User } = require('../Models/userModel');
const Order = require('../Models/orderModel'); // Import the Order model
const crypto = require('crypto');
const dotenv = require('dotenv');
const { Address } = require('../Models/addressModel');

dotenv.config()

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
// Route to create an order
router.post('/payment/:id/:p_id', async (req, res) => {
    const userId = req.params.id;
    const productId = req.params.p_id;

    try {
        const product = await Product.findById(productId);
        const address = await Address.findOne({user:userId});
        const user = await User.findById(userId);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        const options = {
            amount: product.price * 100, // Amount in paise
            currency: 'INR', // Required currency
            receipt: `receipt_order_${productId}`,
            payment_capture: '1',
            notes: {
                product_details: product,
                customer_name: user.username,
                customer_email: user.email,
                customer_address: address,
                customer_mobile: user.phoneNumber,
                
            },
        };

        const order = await razorpay.orders.create(options);
        return res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Route to verify payment
router.post('/payment/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    const shasum = crypto.createHmac('sha256', key_secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest === razorpay_signature) {
        // Payment is successful
        return res.json({ status: 'success' });
    } else {
        // Signature mismatch
        return res.status(400).json({ status: 'failure' });
    }
});

module.exports = { orderRouter: router };
