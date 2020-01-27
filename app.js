"use strict";

require("dotenv").config();

const indexRouter = require("./routes/index/indexRoutes");
const userRouter = require("./routes/user/userRoutes");
const foodRouter = require("./routes/food/foodRoutes");
const stripeRouter = require("./routes/stripe/stripeRoutes");
const accountRouter = require("./routes/account/accountRoutes");
const restaurantRouter = require("./routes/restaurant/restaurantRoutes");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(indexRouter);
app.use(userRouter);
app.use(foodRouter);
app.use(stripeRouter);
app.use(accountRouter);
app.use(restaurantRouter);

// app.use(express.static("public"));

const port = 8000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
