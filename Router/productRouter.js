// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const { Product } = require("../Models/productModel");
// const { User } = require("../Models/userModel");

// const router = express.Router();

// const uploads = multer({
//     storage:multer.diskStorage({
//         destination:function(req,file,cb){
//             cb(null,path.join(__dirname,"..","/uploads/products"))
//         },
//         filename:function(req,file,cb){
//             cb(null,file.originalname)
//         }
//     })
// })


// router.post("/create/:cat_id/:id",uploads.array("images"),async(req,res)=>{
//     try {
//         let images = []
//         const {name,description1,description2,description3,instock,price}=req.body;
//         const Base_URL = process.env.Backend_url;
//         if(process.env.NODE_ENV==='production'){
//             Base_URL = `${req.protocol}://${req.get("host")}`
//         }
        
//         if (req.files && req.files.length > 0) {
//             req.files.forEach(file => {
//                 let url = `${Base_URL}/uploads/products/${file.originalname}`;
//                 images.push({ image: url });
//             });
//         } else {
//             console.log("No files uploaded.");
//         }
//         const productData = {
//             name,
//             description1,
//             description2,
//             description3,
//             images,
//             price,
//             instock,
//             user: req.params.id,
//             category:req.params.cat_id
//           };

//           const user = await User.findOne({_id:req.params.id})
//         if(!user){
//             res.status(400).json({message:"You are not authorized to sell product"})
//         }
//         const existingProduct = await Product.findOne({name});
//         if(existingProduct){
//             res.status(400).json({message:"Product already have this name"})
//         }
//         const product = await Product.create(productData);
//         if(!product){
//             res.status(400).json({message:"Error occured in create product"})
//         }
//         res.status(200).json({message:"Product created successfully",product})

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({message:"Internal server error"});
//     }
// })
// router.get("/getall",async(req,res)=>{
//     try {
//         const product = await Product.find({}).populate("user category","-password");
//         if(!product ){
//             res.status(400).json({message:"Data not found"})
//         }
//         res.status(200).json({message:"Data found successfully",product})
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({message:"Internal server error"});
//     }
// })

// router.get("/getsingle/:id",async(req,res)=>{
//     try {
//         const product = await Product.findOne({_id:req.params.id}).populate("user category","-password");
//         if(!product){
//             res.status(400).json({message:"Product not found"})
//         }
//         res.status(200).json({message:"Product found successfully",product});
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({message:"Internal server error"});
//     }
// })
// router.delete("/remove/:id",async(req,res)=>{
//     try {
//         const product = await Product.findByIdAndDelete({_id:req.params.id});
//         if(!product){
//             res.status(400).json({message:"Error occured in product deletion"})
//         }
//         res.status(200).json({message:"Data removed succesfully",product})
        
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({message:"Internal server error"});
//     }
// })
// router.put("/edit/:id", uploads.array("images"), async (req, res) => {
//     try {
//         const product = await Product.findOne({ _id: req.params.id });
//         if (!product) {
//             return res.status(400).json({ message: "Product not found" });
//         }

//         let images = [];
//         const Base_URL = process.env.Backend_url || `${req.protocol}://${req.get("host")}`;
        
//         if (req.files && req.files.length > 0) {
//             req.files.forEach(file => {
//                 let url = `${Base_URL}/uploads/products/${file.originalname}`;
//                 images.push({ image: url });
//             });
//         }

//         // Update the product fields
//         product.images = images.length > 0 ? images : product.images; // Preserve existing images if no new ones are uploaded
//         product.name = req.body.name || product.name;
//         product.description1 = req.body.description1 || product.description1;
//         product.description2 = req.body.description2 || product.description2;
//         product.description3 = req.body.description3 || product.description3;
//         product.instock = req.body.instock || product.instock; // Ensure the key matches
//         product.price = req.body.price || product.price;
//         // Category and user are not modified in this update logic
//         // If you want to update them, you can add similar checks as above.

//         // Save the updated product
//         const updatedProduct = await product.save();
        
//         res.status(200).json({ message: "Product Updated Successfully", product: updatedProduct });

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

// router.get("/getproduct/:id",async(req,res)=>{
//     try {
//         const user = await User.findOne({_id:req.params.id});
//         const product = await Product.find({user}).populate("user category","-password");
//         if(!product){
//             res.status(400).json({message:"Product Not Found"});
//         }
//         res.status(200).json({message:"Product Found Successfully",product})
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({message:"Internal Server Error"})
//     }
// })
// router.get("/search/:keyword",async(req,res)=>{
//     try {
//         const keyword = req.params.keyword;
//         const product = await Product.find({$or:[
//             {name:{$regex:keyword,$options:"i"}},
//             {description1:{$regex:keyword,$options:"i"}},
//             {description2:{$regex:keyword,$options:"i"}},
//             {description3:{$regex:keyword,$options:"i"}},
//         ]}).populate("category user")
//         if(!product){
//             res.status(400).json({message:"Product not found"})
//         }
//         res.status(200).json({message:"Product found successfully",product})
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({message:"Internal server error"})
//     }
// })
// const productRouter = router;

// module.exports = {productRouter}
const express = require("express");
const multer = require("multer");
const path = require("path");
const { Product } = require("../Models/productModel");
const { User } = require("../Models/userModel");
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for temporary storage
const storage = multer.memoryStorage(); // Use memory storage for direct upload to Cloudinary
const uploads = multer({ storage });

// Create a new product
router.post("/create/:cat_id/:id", uploads.array("images"), async (req, res) => {
    try {
        let images = [];
        const { name, description1, description2, description3, instock, price } = req.body;

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.buffer, {
                    folder: 'products' // Optional: specify a folder in your Cloudinary account
                });
                images.push({ image: result.secure_url });
            }
        }

        const productData = {
            name,
            description1,
            description2,
            description3,
            images,
            price,
            instock,
            user: req.params.id,
            category: req.params.cat_id
        };

        const user = await User.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(400).json({ message: "You are not authorized to sell product" });
        }

        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(400).json({ message: "Product already has this name" });
        }

        const product = await Product.create(productData);
        res.status(200).json({ message: "Product created successfully", product });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Edit a product
router.put("/edit/:id", uploads.array("images"), async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id });
        if (!product) {
            return res.status(400).json({ message: "Product not found" });
        }

        let images = [];
        if (req.files) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.buffer, {
                    folder: 'products' // Optional: specify a folder in your Cloudinary account
                });
                images.push({ image: result.secure_url });
            }
        }

        product.images = images.length > 0 ? images : product.images; // Update images only if new ones are provided
        product.name = req.body.name || product.name;
        product.description1 = req.body.description1 || product.description1;
        product.description2 = req.body.description2 || product.description2;
        product.description3 = req.body.description3 || product.description3;
        product.instock = req.body.instock || product.instock; // Make sure the field name matches
        product.price = req.body.price || product.price;

        await product.save();
        res.status(200).json({ message: "Product Updated Successfully", product });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Other routes remain unchanged...

module.exports = { productRouter: router };
