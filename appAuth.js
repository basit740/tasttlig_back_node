"use strict";

// Set up dotenv
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Set up routes
const authRouter = require("./routes/auth/authRoutes");

// Configure Express
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure routes
app.use(authRouter);

// Boot authorization server
const port = 4000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
