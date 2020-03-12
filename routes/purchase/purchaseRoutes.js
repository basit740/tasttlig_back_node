"use strict";

// Libraries
const purchaseRouter = require("express").Router();
const fetch = require("node-fetch");
const auth = require("../auth/authFunctions");
const Purchase = require("../../db/queries/purchase/purchase");
const { authenticateToken } = auth;

// Use Stripe secret key
const keySecret = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(keySecret);
require("dotenv").config();

// GET all marketplace food purchase
purchaseRouter.get("/purchase", async (req, res) => {
  const purchases = await Purchase.getAllPurchase();
  res.json(purchases);
});

// GET all marketplace food purchase based on user ID
purchaseRouter.get("/purchase/user", authenticateToken, async (req, res) => {
  const purchases = await Purchase.getUserPurchase(req.user.id);
  res.json(purchases);
});

// GET incoming marketplace food orders based on food ID
purchaseRouter.get("/incoming-orders", authenticateToken, async (req, res) => {
  const purchases = await Purchase.getIncomingPurchase(req.user.food_id);
  res.json(purchases);
});

// Get the delivery fee between origin and shipping address
purchaseRouter.get("/delivery-fee", authenticateToken, async (req, res) => {
  let url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=Toronto,ON&destinations=Ottawa,ON&key=${process.env.GOOGLE_DISTANCE_MATRIX_KEY}`;

  fetch(url)
    .then(res => res.json())
    .then(data =>
      res.send({ data: data.rows[0].elements[0].distance.text.split(" ")[0] })
    )
    .catch(err => console.log("Delivery Fee", err));
});

// POST marketplace food purchase
purchaseRouter.post("/purchase", authenticateToken, async (req, res) => {
  const charge = await stripe.charges.create({
    amount: req.body.amount,
    currency: "cad",
    description: req.body.description,
    receipt_email: req.body.email,
    source: req.body.token
  });

  if (charge) {
    const purchase = {
      food_id: req.body.food_id,
      amount: req.body.amount,
      receipt_email: req.body.receipt_email,
      receipt_url: charge.receipt_url,
      fingerprint: charge.payment_method_details.card.fingerprint,
      description: req.body.description,
      shipping_address: req.body.shipping_address,
      quantity: req.body.quantity
    };

    try {
      const purchases = await Purchase.createPurchase(purchase, req.user.id);
      res.json(purchases);
    } catch (err) {
      res.json(err);
    }
  }
});

// PUT incoming marketplace food orders response from publisher
purchaseRouter.put("/incoming-orders", async (req, res) => {
  const purchase = {
    accept: req.body.accept,
    reject_note: req.body.reject_note
  };
  try {
    const purchases = await Purchase.updateIncomingPurchase(purchase);
    res.json(purchases);
  } catch (err) {
    console.log("Incoming Order Response", err);
  }
});

module.exports = purchaseRouter;
