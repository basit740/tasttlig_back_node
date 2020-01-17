"use strict";

require("dotenv").config();
const userRouter = require("./routes/user/userRoutes");
const stripeRouter = require("./routes/stripe/stripeRoutes");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(userRouter);
app.use(stripeRouter);

// app.use(express.static("public"));

const port = 8000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
