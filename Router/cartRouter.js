const express = require('express');
const {Cart} = require('../Models/cartModel');
const {Product}=require('../Models/productModel');


const router = express.Router();

// Add a product to the cart or increase its quantity
router.post("/add/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;

    try {
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if the product already exists in the cart
        const itemIndex = cart.items.findIndex(item => item.product == productId);

        if (itemIndex > 0) {
            // If product exists, increase its quantity
            cart.items[itemIndex].quantity += 1;
        } else {
            // If product doesn't exist, add it to the cart
            cart.items.push({ product: productId, quantity: 1 });
        }

        await cart.save();

        const totalPrice = await calculateTotalPrice(cart);
        return res.status(200).json({ message: "Product added successfully", cart, totalPrice });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Decrease product quantity or remove if quantity is 0
router.post("/decrease/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;

    try {
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(400).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.product == productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity -= 1;

            // Remove the product if quantity is 0
            if (cart.items[itemIndex].quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            }

            await cart.save();

            const totalPrice = await calculateTotalPrice(cart);
            return res.status(200).json({ message: "Product quantity updated successfully", cart, totalPrice });
        } else {
            return res.status(400).json({ message: "Product not found in cart" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Remove a product from the cart
router.post("/remove/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;

    try {
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(400).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.product == productId);

        if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1);

            await cart.save();

            const totalPrice = await calculateTotalPrice(cart);
            return res.status(200).json({ message: "Product removed successfully", cart, totalPrice });
        } else {
            return res.status(400).json({ message: "Product not found in cart" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get cart details including total price
router.get("/get/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const cart = await Cart.findOne({ user: userId }).populate("items.product", "name price");

        if (!cart) {
            return res.status(400).json({ message: "Cart not found" });
        }

        const totalPrice = await calculateTotalPrice(cart);
        return res.status(200).json({ message: "Cart retrieved successfully", cart, totalPrice });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Helper function to calculate total price
async function calculateTotalPrice(cart) {
    let totalPrice = 0;

    for (const item of cart.items) {
        const product = await Product.findById(item.product);
        totalPrice += product.price * item.quantity;
    }

    return totalPrice;
}

const cartRouter = router;

module.exports = {cartRouter};
