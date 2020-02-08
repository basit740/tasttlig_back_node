"use strict";

require("dotenv").config();
const authRouter = require("./routes/auth/authRoutes");
const keySecret = process.env.SECRET_KEY;
const express = require("express");
const stripe = require("stripe")(keySecret);
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(authRouter);

// app.use(express.static("public"));

const port = 4000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
