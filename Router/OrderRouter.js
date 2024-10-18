const express = require('express');
const Razorpay = require('razorpay');
const { Product } = require('../Models/productModel');
const { User } = require('../Models/userModel');
const Order = require('../Models/orderModel');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { Address } = require('../Models/addressModel');
const { Cart } = require('../Models/cartModel');

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment for a single product
router.post('/payment/:id/:p_id', async (req, res) => {
    const userId = req.params.id;
    const productId = req.params.p_id;

    try {
        const product = await Product.findById(productId);
        const address = await Address.findOne({ user: userId });
        const user = await User.findById(userId);
        
        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const options = {
            amount: product.price * 100,
            currency: 'INR',
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

        const newOrder = new Order({
            user: userId,
            product_details: product,
            totalAmount: product.price,
            razorpayOrderId: order.id,
            status: 'pending',
            receipt: `receipt_order_${userId}`,
            currency: 'INR',
            created_at: new Date(),
            attempts: 0,
            amount_paid: product.price,
            amount_due: 0,
        });
        await newOrder.save();
        console.log('Razorpay order response:', order);
        return res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Purchase from cart
router.post('/purchase/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const cart = await Cart.findOne({ user: userId });
        const address = await Address.findOne({ user: userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Cart is empty or not found' });
        }

        const { totalPrice, productDetails } = await calculateTotalPrice(cart);
        
        const options = {
            amount: totalPrice * 100, // Convert to paise
            currency: 'INR',
            receipt: `receipt_order_${userId}`,
            payment_capture: 1,
            notes: {
                userId,
                products: productDetails,
                address: address,
            },
        };

        const order = await razorpay.orders.create(options);
        const newOrder = new Order({
            user: userId,
            items: productDetails,
            totalAmount: totalPrice,
            razorpayOrderId: order.id,
            status: 'pending',
            receipt: `receipt_order_${userId}`,
            currency: 'INR',
            created_at: new Date(),
            attempts: 0,
            amount_paid: totalPrice,
            amount_due: 0,
        });

        await newOrder.save();

        console.log('Razorpay order created:', order);
        return res.status(200).json({ status: 'success', order });
    } catch (error) {
        console.error('Error processing purchase:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Route to verify payment
router.post('/payment/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    const shasum = crypto.createHmac('sha256', key_secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    console.log('Payment verification:', {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        computed_digest: digest,
    });

    if (digest === razorpay_signature) {
        console.log('Payment verified successfully.');
        // You may want to update the order status here
        return res.json({ status: 'success' });
    } else {
        console.error('Payment verification failed: Signature mismatch');
        return res.status(400).json({ status: 'failure' });
    }
});

// Calculate total price from cart
async function calculateTotalPrice(cart) {
    const productIds = cart.items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    let totalPrice = 0;
    const productDetails = [];

    for (const item of cart.items) {
        const product = products.find(p => p._id.toString() === item.product.toString());
        if (product) {
            const itemTotalPrice = product.price * item.quantity;
            totalPrice += itemTotalPrice;

            productDetails.push({
                productId: product._id,
                productName: product.name,
                productPrice: product.price,
                quantity: item.quantity,
                totalItemPrice: itemTotalPrice,
            });
        }
    }

    return {
        totalPrice,
        productDetails,
    };
}

module.exports = { orderRouter: router };
