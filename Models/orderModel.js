const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number }],
    totalAmount: { type: Number, required: true },
    razorpayOrderId: { type: String, required: true },
    status: { type: String, required: true, default: 'pending' },
    receipt: { type: String, required: true },
    currency: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    attempts: { type: Number, default: 0 },
    amount_paid: { type: Number, default: 0 },
    amount_due: { type: Number, required: true },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order; // Ensure you export the model like this
