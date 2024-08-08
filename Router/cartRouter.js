const express = require("express");
const { User } = require("../Models/userModel");
const { Cart } = require("../Models/cartModel");
const { Product } = require("../Models/productModel");

const router = express.Router();

  router.post("/add/:id/:p_id",async(req,res)=>{
    try {
        const product = req.params.p_id;
        const user = req.params.id;
        const { quantity } = req.body;
    
        const cart = await Cart.findOne({ user });
        const extistingProduct = await Product.findOne({ _id: product });
    
        const name = extistingProduct.name;
        const price = extistingProduct.price;
        const image = extistingProduct.images[0].image;
        console.log(extistingProduct.name);
    
        if (cart) {
          // if cart exists for the user
          let itemIndex = cart.items.findIndex((p) => p.product == product);
    
          // Check if product exists or not
          if (itemIndex > -1) {
            let productItem = cart.items[itemIndex];
            productItem.quantity += quantity;
            cart.items[itemIndex] = productItem;
          } else {
            cart.items.push({ product, name, quantity, price, image });
          }
          await cart.save();
          return res.status(201).send({
            success: true,
            message: "Cart Added",
            cart,
          });
        } else {
          // no cart exists, create one
          const newCart = await Cart.create({
            user,
            items: [{ product, name, quantity, price, image }],
          });
          return res.status(201).json({
            success: true,
            message: "Cart Added",
            newCart,
          });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Eror while getitng single product",
          error,
        });
      }
  })

  router.get("/getcart/:id",async(req,res)=>{
    try {
   
     const cart = await Cart.find({user:req.params.id}).populate("user items.product","-password");
     if(!cart){
        res.status(400).json({message:"Data not found"})
     }
     res.status(200).json({message:"Data found successfully",cart})
    } catch (error) {
        
    }
  })
 
  router.delete()
const cartRouter = router;

module.exports = { cartRouter };
