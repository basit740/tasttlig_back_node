"use strict";

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");

// Set up dotenv
require("dotenv").config();
require("./db/db-config");

const profile_router = require('./routes/user/profile');
const user_authentication_router = require('./routes/user/authentication');
const experience_router = require('./routes/experience/experience');
const food_sample_router = require('./routes/food_sample/food_sample');
const s3UploaderRouter = require("./routes/s3Uploader/s3UploaderRoutes");
const payment_router = require('./routes/payment/payment')
const newsletter_router = require("./routes/user/newsletter");

const app = express();
let corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logger('combined'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(user_authentication_router);
app.use(profile_router);
app.use(experience_router);
app.use(food_sample_router);
app.use(s3UploaderRouter);
app.use(payment_router);
app.use(newsletter_router);

// Boot development server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
