// const express = require('express');
// const { Product } = require('../Models/productModel');
// const Razorpay = require('razorpay');
// const crypto = require('crypto');

// const router = express.Router();

// const razorpay = new Razorpay({
//   key_id: 'rzp_test_zVUZCNrVjLSv79',  // Replace with your live Razorpay Key ID when going live
//   key_secret: process.env.payment_key // Replace with your live Razorpay Key Secret when going live
// });

// // Route to create an order or verify payment
// router.post('/payment/:p_id', async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//   const productId = req.params.p_id; // Correctly access productId from params

//   // Check if productId exists to create a new order
//   if (productId && !razorpay_order_id) {
//     try {
//       // Fetch the product details from the database using productId
//       const product = await Product.findById(productId);

//       if (!product) {
//         return res.status(404).json({ message: 'Product not found' });
//       }

//       // Create order options
//       const options = {
//         amount: product.price * 100, // Amount in paise
//         currency: 'INR',
//         receipt: `receipt_order_${productId}`, // Unique receipt based on product ID
//         payment_capture: '1', // Automatically capture payment
//       };

//       // Create the Razorpay order
//       const order = await razorpay.orders.create(options);

//       // Send the created order details back to the client
//       return res.json(order);
//     } catch (error) {
//       console.error('Error creating Razorpay order:', error);
//       return res.status(500).json({ error: 'Something went wrong while creating the order' });
//     }
//   }

//   // If razorpay_order_id, razorpay_payment_id, and razorpay_signature are provided, verify the payment
//   if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
//     try {
//       const key_secret = process.env.payment_key; // Razorpay secret key

//       // Generate the HMAC SHA256 signature for verification
//       const shasum = crypto.createHmac('sha256', key_secret);
//       shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//       const digest = shasum.digest('hex');

//       // Verify the signature
//       if (digest === razorpay_signature) {
//         // Payment is successful
//         return res.json({ status: 'success' });
//       } else {
//         // Signature mismatch, payment verification failed
//         return res.json({ status: 'failure' });
//       }
//     } catch (error) {
//       console.error('Error verifying payment:', error);
//       return res.status(500).json({ error: 'Something went wrong while verifying the payment' });
//     }
//   }

//   // If no valid data is provided
//   return res.status(400).json({ error: 'Invalid request data' });
// });

// const orderRouter = router;

// module.exports = {orderRouter};

const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Product } = require('../Models/productModel');
const Order = require('../Models/orderModel');  // Import the Order model
const { User } = require('../Models/userModel');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: "rzp_test_zVUZCNrVjLSv79",
  key_secret: process.env.payment_key
});

// Route to create an order
router.post('/payment/:id/:p_id/', async (req, res) => {
  const userId = req.params.id;
  const  productId  = req.params.p_id;

  if (productId) {
    try {
      // Fetch the product details from the database using productId
      const product = await Product.findById(productId);
      const user = await User.findById(userId);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      if(!user){
        return res.status(400).json({message:"User not found"});
      }
      // Create order options
      const options = {
        amount: product.price * 100, // Amount in paise
        currency: 'INR',
        receipt: `receipt_order_${productId}`, // Unique receipt based on product ID
        payment_capture: '1', // Automatically capture payment
        notes: {
        product_details: product,
       customer_name: user.username,  // Get customer name from the request body
       customer_email: user.email, // Get customer email from the request body
       custemer_address:user.address,
       customer_mobile:user.phoneNumber
  }
      };

      // Create the Razorpay order
      const order = await razorpay.orders.create(options);

      // Save order details to MongoDB
      const newOrder = new Order({
        order_id: order.id,
        amount: order.amount,
        amount_due: order.amount_due,
        amount_paid: order.amount_paid,
        attempts: order.attempts,
        created_at: new Date(order.created_at * 1000), // Convert timestamp to Date
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        notes: order.notes,
      });

      await newOrder.save();  // Save the order in MongoDB

      // Send the created order details back to the client
      return res.json(order);
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  return res.status(400).json({ error: 'Invalid product ID' });
});

const orderRouter = router;

module.exports = {orderRouter};

