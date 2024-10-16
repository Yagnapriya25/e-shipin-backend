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

const allowedOrigins = [
    'http://localhost:3000', // Replace with your local development URL
    'https://your-production-domain.com' // Replace with your production URL
  ];
  
  const corsOptions = {
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error('Not allowed by CORS')); // Reject the request
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow credentials (like cookies)
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  };
  
  // Use CORS with the specified options
  app.use(cors(corsOptions));

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
