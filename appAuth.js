"use strict";

require("dotenv").config();
const authRouter = require("./routes/auth/authRoutes");
const keySecret = process.env.SECRET_KEY;
const express = require("express");
const stripe = require("stripe")(keySecret);
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(authRouter);

// app.use(express.static("public"));

// Create AJAX database environment
const environment = process.env.NODE_ENV || "development";
const configuration = require("./knexfile")[environment];
const database = require("knex")(configuration);

const port = 4000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
