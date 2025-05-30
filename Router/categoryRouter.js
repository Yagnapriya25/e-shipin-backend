const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { Category } = require('../Models/categoryModel');
const { Product } = require('../Models/productModel');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

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
          photo = await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream({ folder: 'categories' }, (error, result) => {
                  if (error) {
                      return reject(error);
                  }
                  resolve(result.secure_url);
              });
              // Pipe the file stream to Cloudinary
              streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
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


// Get all categories
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

// Get a single category
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

// Get products by category ID
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

// Edit a category
router.put("/edit/:c_id", upload.single("photo"), async (req, res) => {
  try {
      const category = await Category.findById(req.params.c_id);
      if (!category) {
          return res.status(400).json({ message: "Category not found" });
      }

      let photo = category.photo; // Preserve existing photo if not updated

      if (req.file) {
          // Use a Promise to handle the asynchronous upload
          photo = await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream({ folder: 'categories' }, (error, result) => {
                  if (error) {
                      return reject(error);
                  }
                  resolve(result.secure_url); // Resolve with the secure URL
              });
              // Create a readable stream from the buffer and pipe it to Cloudinary
              streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
      }

      // Update category
      const updatedCategory = await Category.findByIdAndUpdate(
          req.params.c_id,
          { ...req.body, photo },
          { new: true }
      );

      if (!updatedCategory) {
          return res.status(400).json({ message: "Error occurred in data updation" });
      }

      res.status(200).json({ message: "Data Updated Successfully", category: updatedCategory });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Delete a category
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
