
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const { dbConnection } = require('./db');
const path = require("path");
const { userRouter } = require('./Router/userRouter.js');
const { categoryRouter } = require('./Router/categoryRouter.js');
const { productRouter } = require('./Router/productRouter.js');
const { cartRouter } = require('./Router/cartRouter.js');
const { addressRouter } = require('./Router/addressRouter.js');
const { orderRouter } = require('./Router/OrderRouter.js');
const cloudinary = require('cloudinary').v2; // Import Cloudinary

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors({
    origin: '*', // Allow only your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
    credentials: true // Allow credentials if needed
}));

app.use(bodyParser.json());

dbConnection();

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/ping', (req, res) => {
    res.status(200).send('Service is awake');
  });

// Routes
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
