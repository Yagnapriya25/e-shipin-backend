const express = require('express');
const { Cart } = require('../Models/cartModel');
const { Product } = require('../Models/productModel');

const router = express.Router();

// Add a product to the cart or increase its quantity
router.put("/add/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;

    try {
        let cart = await Cart.findOne({ user: userId }) || new Cart({ user: userId, items: [] });

        const itemIndex = cart.items.findIndex(item => item.product == productId);

        if (itemIndex >= 0) {
            // If product exists, increase its quantity
            cart.items[itemIndex].quantity += 1;
        } else {
            // If product doesn't exist, add it to the cart
            cart.items.push({ product: productId, quantity: 1 });
        }

        await cart.save();
        const totalPrice = await calculateTotalPrice(cart);
        return res.status(200).json({ status: 'success', message: "Product added successfully", cart, totalPrice });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: "Internal server error" });
    }
});

router.put("/increase/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;

    try {
        let cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(400).json({ status: 'error', message: "Cart not found" });

        const itemIndex = cart.items.findIndex(item => item.product == productId);

        if (itemIndex > -1) {
            // Increase the quantity
            cart.items[itemIndex].quantity += 1;
            await cart.save();
            const totalPrice = await calculateTotalPrice(cart);
            return res.status(200).json({ status: 'success', message: "Product quantity updated successfully", cart, totalPrice });
        } else {
            return res.status(400).json({ status: 'error', message: "Product not found in cart" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: "Internal server error" });
    }
});

// Decrease product quantity or remove if quantity is 0
router.put("/decrease/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;

    try {
        let cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(400).json({ status: 'error', message: "Cart not found" });

        const itemIndex = cart.items.findIndex(item => item.product == productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity -= 1;

            // Remove the product if quantity is 0
            if (cart.items[itemIndex].quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            }

            await cart.save();
            const totalPrice = await calculateTotalPrice(cart);
            return res.status(200).json({ status: 'success', message: "Product quantity updated successfully", cart, totalPrice });
        } else {
            return res.status(400).json({ status: 'error', message: "Product not found in cart" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: "Internal server error" });
    }
});

// Remove a product from the cart
router.delete("/remove/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;

    try {
        let cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(400).json({ status: 'error', message: "Cart not found" });

        const itemIndex = cart.items.findIndex(item => item.product == productId);

        if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1);
            await cart.save();
            const totalPrice = await calculateTotalPrice(cart);
            return res.status(200).json({ status: 'success', message: "Product removed successfully", cart, totalPrice });
        } else {
            return res.status(400).json({ status: 'error', message: "Product not found in cart" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: "Internal server error" });
    }
});

router.delete("/removeAll/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne( {user:userId} );
        console.log(cart);
        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: "Cart not found or empty." });
        }

        const totalPrice = await calculateTotalPrice(cart);

        // Delete the cart items
        const deleteResult = await Cart.deleteMany({ user: userId });

        
        if (deleteResult.deletedCount === 0) {
            return res.status(500).json({ message: "No items were deleted." });
        }

        res.status(200).json({
            message: "All cart items removed successfully.",
            totalPrice:0,
            cart: [], 
        });
    } catch (error) {
        console.error("Error during deletion:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/get/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const cart = await Cart.findOne({ user: userId })
        .populate("user", "-password") // Populate user without password
        .populate({
            path: 'items.product', // Populate the product
            populate: {
                path: 'category', // Populate the category
                select: 'name' // Specify which fields to select, e.g., just the category name
            }
        });        if (!cart) return res.status(400).json({ status: 'error', message: "Cart not found" });

        const totalPrice = await calculateTotalPrice(cart);
        return res.status(200).json({ status: 'success', message: "Cart retrieved successfully", cart, totalPrice });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: "Internal server error" });
    }
});

async function calculateTotalPrice(cart) {
    const productIds = cart.items.map(item => {
        return item.product._id ? item.product._id.toString() : item.product.toString();
    });

    // Fetch products by their IDs
    const products = await Product.find({ _id: { $in: productIds } });

    // Create a map to easily access product data by ID
    const productMap = products.reduce((map, product) => {
        map[product._id.toString()] = {
            price: product.price,
            name: product.name // Store the product name as well
        };
        return map;
    }, {});

    let totalPrice = 0;
    const productDetails = []; // Array to hold details of each product price

    for (const item of cart.items) {
        const productId = item.product._id ? item.product._id.toString() : item.product.toString(); // Handle both cases
        const productData = productMap[productId]; // Get product data from the map

        if (productData) { // Check if the product exists in the map
            const itemTotalPrice = productData.price * item.quantity; // Calculate total price for the item
            totalPrice += itemTotalPrice; // Add to the total cart price

            // Push the product details into the array
            productDetails.push({
                productId: productId,
                productName: productData.name, // Include product name
                productPrice: productData.price,
                quantity: item.quantity,
                totalItemPrice: itemTotalPrice // Total price for this item
            });
        } else {
            console.warn(`Product ID ${productId} not found in products`);
        }
    }

    return {
        totalPrice,
        productDetails // Return both total price and product details
    };
}










const cartRouter = router;

module.exports = { cartRouter };
