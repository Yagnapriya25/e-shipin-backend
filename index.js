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

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;

// Configure CORS
const allowedOrigins = ['http://localhost:3000', 'https://your-production-url.com']; // Add your production URL here
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(bodyParser.json());
app.use(express.json()); // This line is already included

dbConnection();

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Define routes
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

// Start the server
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
