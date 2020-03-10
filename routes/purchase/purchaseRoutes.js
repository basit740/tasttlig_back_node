"use strict";

// Libraries
const purchaseRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Purchase = require("../../db/queries/purchase/purchase");
const { authenticateToken } = auth;

// Use Stripe secret key
require("dotenv").config();
const keySecret = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(keySecret);

// GET all marketplace food purchase based on user ID
purchaseRouter.get("/user/purchase", authenticateToken, async (req, res) => {
  const purchases = await Purchase.getUserPurchase(req.user.id);
  res.json(purchases);
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
      amount: req.body.amount,
      receipt_email: req.body.receipt_email,
      receipt_url: charge.receipt_url,
      fingerprint: charge.payment_method_details.card.fingerprint,
      description: req.body.description,
      shipping_address: req.body.shipping_address,
      food_number: req.body.food_number,
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

module.exports = purchaseRouter;
