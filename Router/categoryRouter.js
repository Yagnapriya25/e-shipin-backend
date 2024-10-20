// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const dotenv = require('dotenv');
// const {Category} = require('../Models/categoryModel');
// const { Product } = require('../Models/productModel');
// dotenv.config();

// const upload = multer({
//   storage: multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.join(__dirname, "..", "uploads", "category"));
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname);
//     }
//   })
// });

// const router = express.Router();

// // Create a new category
// router.post('/create', upload.single("photo"),async (req, res) => {
//   const { name } = req.body;

//   try {
//       // Check if category already exists
//       let category = await Category.findOne({ name });
//       if (category) {
//           return res.status(400).json({ msg: 'Category already exists' });
//       }
//      let photo;
//      const Base_URL = process.env.Backend_url;
//      if(process.env.NODE_ENV==='production'){
//       Base_URL=`${req.protocol}://${req.get("host")}`
//      } 
//      if(req.file){
//       photo=`${Base_URL}/uploads/category/${req.file.originalname}`
//      }
//       // Create new category
//       category = new Category({
//           name,
//           photo
//       });

//       await category.save();

//       res.status(201).json({ msg: 'Category created successfully', category });
//   } catch (err) {
//       console.error(err);
//       res.status(500).send('Internal Server Error');
//   }
// });

// router.get('/getall',async(req,res)=>{
//   try {
//     const category = await Category.find({});
//     if(!category){
//       res.status(400).json({message:"data not found"})
//     }
//     res.status(200).json({message:"data found successfully",length:category.length,category})
//   } catch (error) {
//     console.error(error);
//       res.status(500).send('Internal Server Error');
//   }
// })
// router.get("/getsingle/:id",async(req,res)=>{
//   try {
//     const category = await Category.findById({_id:req.params.id});
//     if(!category){
//       res.status(400).json({message:"data not found"})
//     }
//     res.status(200).json({message:"data found successfully",category})
//   } catch (error) {
//     console.error(error);
//       res.status(500).send('Internal Server Error');
//   }
// })

// router.get("/:cat_id", async (req, res) => {
//   try {
//       const products = await Product.find({ category: req.params.cat_id }).populate("user", "-password");
      
//       if (!products || products.length === 0) {
//           return res.status(404).json({ message: "No products found for this category" });
//       }
      
//       res.status(200).json({ message: "Products found successfully", products });
//   } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: "Internal server error" });
//   }
// });

// router.put("/edit/:c_id",upload.single("photo"),async(req,res)=>{
//   try {
//       let photo;
//       let Base_URL = process.env.Backend_url;
//       if(process.env.NODE_ENV==="production"){
//           Base_URL=`${req.protocol}://${req.get("host")}`
//       }
//        if(req.file){
//           photo = `${Base_URL}/uploads/category/${req.file.originalname}`
//        }
//        const category = await Category.findByIdAndUpdate(
//           req.params.c_id,
//           {...req.body,photo},
          
//           {new:true}
//        )
//        if(!category){
//           res.status(400).json({message:"Error Occured in Data Updation"})
//        }
//        res.status(200).json({message:"Data Updated Successfully",category})

//   } catch (error) {
//       console.error(error);
//       res.status(500).json({message:'Internal Server Error'});
//   }
// })
// router.delete("/remove/:id",async(req,res)=>{
//   try {
//     const category = await Category.findOneAndDelete({_id:req.params.id})
//     if(!category){
//       res.status(400).json({message:"Error occured in data deletion"})
//     }
//     res.status(200).json({message:"Data deleted successfully"})
    
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({message:"Internal server error"})
//   }
// })
// const categoryRouter = router;

// module.exports = {categoryRouter}

const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { Category } = require('../Models/categoryModel');
const { Product } = require('../Models/productModel');
const cloudinary = require('cloudinary').v2;

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer to handle file uploads
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory for Cloudinary upload

const router = express.Router();

// Create a new category
router.post('/create', upload.single("photo"), async (req, res) => {
    const { name } = req.body;

    try {
        // Check if category already exists
        let category = await Category.findOne({ name });
        if (category) {
            return res.status(400).json({ msg: 'Category already exists' });
        }

        let photo;
        if (req.file) {
            const result = await cloudinary.uploader.upload_stream({ folder: 'categories' }, (error, result) => {
                if (error) {
                    return res.status(500).json({ msg: 'Error uploading to Cloudinary' });
                }
                photo = result.secure_url;
            });
            req.file.stream.pipe(result);
        }

        // Create new category
        category = new Category({
            name,
            photo
        });

        await category.save();

        res.status(201).json({ msg: 'Category created successfully', category });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/getall', async (req, res) => {
    try {
        const categories = await Category.find({});
        if (!categories) {
            return res.status(400).json({ message: "Data not found" });
        }
        res.status(200).json({ message: "Data found successfully", length: categories.length, categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get("/getsingle/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(400).json({ message: "Data not found" });
        }
        res.status(200).json({ message: "Data found successfully", category });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get("/:cat_id", async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.cat_id }).populate("user", "-password");

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found for this category" });
        }

        res.status(200).json({ message: "Products found successfully", products });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/edit/:c_id", upload.single("photo"), async (req, res) => {
    try {
        let photo;
        if (req.file) {
            const result = await cloudinary.uploader.upload_stream({ folder: 'categories' }, (error, result) => {
                if (error) {
                    return res.status(500).json({ msg: 'Error uploading to Cloudinary' });
                }
                photo = result.secure_url;
            });
            req.file.stream.pipe(result);
        }

        const category = await Category.findByIdAndUpdate(
            req.params.c_id,
            { ...req.body, photo },
            { new: true }
        );

        if (!category) {
            return res.status(400).json({ message: "Error occurred in data updation" });
        }
        res.status(200).json({ message: "Data Updated Successfully", category });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete("/remove/:id", async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ _id: req.params.id });
        if (!category) {
            return res.status(400).json({ message: "Error occurred in data deletion" });
        }
        res.status(200).json({ message: "Data deleted successfully" });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

const categoryRouter = router;

module.exports = { categoryRouter };
