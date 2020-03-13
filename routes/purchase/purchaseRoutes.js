"use strict";

// Libraries
const purchaseRouter = require("express").Router();
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

// POST marketplace food purchase
purchaseRouter.post("/purchase", authenticateToken, async (req, res) => {
  const charge = await stripe.charges.create({
    amount: req.body.cost,
    currency: "cad",
    description: req.body.description,
    receipt_email: req.body.email,
    source: req.body.token
  });

  if (charge) {
    const purchase = {
      cost: req.body.cost,
      receipt_email: req.body.receipt_email,
      receipt_url: charge.receipt_url,
      fingerprint: charge.payment_method_details.card.fingerprint,
      description: req.body.description,
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

// PUT incoming marketplace food orders response from admin
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
