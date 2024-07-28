const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const { dbConnection } = require('./db');
const { userRouter } = require('./Router/userRouter.js');

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();


const PORT = process.env.PORT || 8080;

app.use(express.json())

app.use(cors({}));

app.use(bodyParser.json());

dbConnection();

app.use("/api/user",userRouter);

app.listen(PORT,()=>console.log(`localhost running under:${PORT}`))
