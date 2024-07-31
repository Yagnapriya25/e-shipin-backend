const express = require("express");
const multer = require("multer");
const path = require("path");
const { Product } = require("../Models/productModel");

const router = express.Router();

const uploads = multer({
    storage:multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,path.join(__dirname,"..","/uploads/products"))
        },
        filename:function(req,file,cb){
            cb(null,file.originalname)
        }
    })
})


router.post("/create",uploads.array("images"),async(req,res)=>{
    try {
        let images = [];
        const {name,description1,description2,description3,instock,price}=req.body;
        const Base_URL = process.env.Backend_url;
        if(process.env.NODE_ENV==='production'){
            Base_URL = `${req.protocol}://${req.get("host")}`
        }
        if(req.files.length>0){
            req.files.forEach(file=>{
                let url = `${Base_URL}/uploads/products/${req.file.originalname}`
                images.push({image:url})
            })

        }
        const productData = {
            name,
            description1,
            description2,
            description3,
            images,
            price,
            Instock,
            user: req.user._id
          };

        const existingProduct = await Product.findOne({name});
        if(existingProduct){
            res.status(400).json({message:"Product already have this name"})
        }
        const product = await Product.create(productData);
        if(!product){
            res.status(400).json({message:"Error occured in create product"})
        }
        res.status(200).json({message:"Product created successfully",product})

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
})

const productRouter = router;

module.exports = {productRouter}