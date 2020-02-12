"use strict";

const stripeRouter = require("express").Router();
const keySecret = process.env.SECRET_KEY;

const stripe = require("stripe")(keySecret);

stripeRouter.post("/charge", (req, res) => {
  res.send("POST Charge!");
  // table
  //   .insert([
  //     {
  //       user_id: table
  //         .from("users")
  //         .select("id")
  //         .limit(1),
  //       amount: req.body.amount,
  //       receipt_email: req.body.receipt_email,
  //       receipt_url: req.body.token.receipt_url,
  //       fingerprint: req.body.token.fingerprint
  //     }
  //   ])
  //   .into("purchases")
  //   .then(res => {
  //     console.log("Response", res);
  //   })
  //   .catch(err => {
  //     console.log("Error", err);
  //   });
  
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

module.exports = stripeRouter;
