"use strict";

require("dotenv").config();

const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(keySecret);
const bodyParser = require("body-parser");

const app = express();
// app.use(express.static("public"));

// Create AJAX database environment
const environment = process.env.NODE_ENV || "development";
const configuration = require("./knexfile")[environment];
const database = require("knex")(configuration);

// Set up CORS
app.use(cors());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/charge", (req, res) => {
  console.log("req body", req.body.email);
  stripe.charges
    .create({
      amount: parseInt(req.body.amount) * 100,
      currency: "cad",
      description: "Example charge",
      source: req.body.token,
      receipt_email: req.body.email
    })
    .then(res => {
      console.log("charge response backend", res);
    })
    .catch(err => {
      console.log("charge err backend", err);
    });
});

app.listen(8000);
