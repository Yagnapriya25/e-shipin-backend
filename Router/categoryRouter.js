const express = require('express');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const { Category } = require('../Models/categoryModel');
dotenv.config();

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "..", "uploads", "category"));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
});

const router = express.Router();

// Create a new category
router.post('/create', upload.single('picture'), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    let picture;
    let Base_URL = process.env.Backend_url;
    if (process.env.NODE_ENV === 'production') {
      Base_URL = `${req.protocol}://${req.get('host')}`;
    }
    if (req.file) {
      picture = `${Base_URL}/uploads/category/${req.file.originalname}`;
    }

    const category = new Category({ name, picture });

    await category.save();

    res.status(200).json({ message: 'Category added successfully', category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a single category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a category by ID
router.put('/:id', upload.single('picture'), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existingCategory = await Category.findOne({ name, _id: { $ne: req.params.id } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    let picture;
    let Base_URL = process.env.Backend_url;
    if (process.env.NODE_ENV === 'production') {
      Base_URL = `${req.protocol}://${req.get('host')}`;
    }
    if (req.file) {
      picture = `${Base_URL}/uploads/category/${req.file.originalname}`;
    }

    const category = await Category.findByIdAndUpdate(req.params.id, { name, picture }, { new: true });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a category by ID
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const categoryRouter = router;

module.exports = {categoryRouter}
