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


// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

dotenv.config();


const app = express();


const PORT = process.env.PORT || 8080;

app.use(express.json())

app.use(cors({
    origin: 'http://localhost:3000', // Allow only your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    credentials: true // Allow credentials if needed
}));

app.use(bodyParser.json());

dbConnection();

app.use("/uploads",express.static(path.join(__dirname,"uploads")))

app.use("/api/user",userRouter);

app.use("/api/category",categoryRouter)

app.use("/api/product",productRouter);

app.use("/api/cart",cartRouter);

app.use("/api/address",addressRouter)

app.use("/api/order",orderRouter);

app.listen(PORT,()=>console.log(`localhost running under:${PORT}`))
