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

        // Fetch the cart before deletion
        const cart = await Cart.findOne( {user:userId} );
        console.log(cart);
        // Check if the cart exists and has items
        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: "Cart not found or empty." });
        }

        // Calculate the total price before deleting
        const totalPrice = await calculateTotalPrice(cart);

        // Delete the cart items
        const deleteResult = await Cart.deleteMany({ user: userId });

        // Log the delete result to confirm it
        console.log("Delete Result:", deleteResult);

        // Check if items were deleted
        if (deleteResult.deletedCount === 0) {
            return res.status(500).json({ message: "No items were deleted." });
        }

        // Return the total price and an indication that the cart is empty
        res.status(200).json({
            message: "All cart items removed successfully.",
            totalPrice:0,
            cart: [], // Return an empty array since the cart is deleted
        });
    } catch (error) {
        console.error("Error during deletion:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


async function calculateTotalPrice(cart) {
    const productIds = cart.items.map(item => {
        return item.product._id ? item.product._id.toString() : item.product.toString();
    });

    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = products.reduce((map, product) => {
        map[product._id.toString()] = product.price;
        return map;
    }, {});

    let totalPrice = 0;
    for (const item of cart.items) {
        const productId = item.product._id ? item.product._id.toString() : item.product.toString();
        const productPrice = productMap[productId];

        if (productPrice !== undefined) {
            totalPrice += productPrice * item.quantity;
        } else {
            console.warn(`Product ID ${productId} not found in products`);
        }
    }

    return totalPrice;
}



router.get("/get/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const cart = await Cart.findOne({ user: userId }).populate("items.product", "name price");
        if (!cart) return res.status(400).json({ status: 'error', message: "Cart not found" });

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

    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = products.reduce((map, product) => {
        map[product._id.toString()] = product.price; // Ensure toString() is used for consistency
        return map;
    }, {});


    let totalPrice = 0;
    for (const item of cart.items) {
        const productId = item.product._id ? item.product._id.toString() : item.product.toString(); // Handle both cases
        const productPrice = productMap[productId]; // Get price from the map

        if (productPrice !== undefined) { // Check if the product exists in the map
            totalPrice += productPrice * item.quantity; // Calculate total price
        } else {
            console.warn(`Product ID ${productId} not found in products`);
        }
    }

    return totalPrice;
}




const cartRouter = router;

module.exports = { cartRouter };
