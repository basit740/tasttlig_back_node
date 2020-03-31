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

// GET all food purchases
purchaseRouter.get("/purchase", async (req, res) => {
  const purchases = await Purchase.getAllPurchase();
  res.json(purchases);
});

// GET all food purchases based on user ID
purchaseRouter.get("/purchase/user", authenticateToken, async (req, res) => {
  const purchases = await Purchase.getUserPurchase(req.user.id);
  res.json(purchases);
});

// POST food purchase
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
      profile_img_url: req.body.profile_img_url,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      food_img_url: req.body.food_img_url,
      quantity: req.body.quantity,
      description: req.body.description,
      cost: req.body.cost,
      ready_time: req.body.ready_time,
      time_type: req.body.time_type,
      food_code: req.body.food_code,
      order_code: req.body.order_code,
      phone_number: req.body.phone_number,
      receipt_email: req.body.receipt_email,
      receipt_url: charge.receipt_url,
      fingerprint: charge.payment_method_details.card.fingerprint
    };

    try {
      const purchases = await Purchase.createPurchase(purchase, req.user.id);
      res.json(purchases);
    } catch (err) {
      res.json(err);
    }
  }
});

// PUT food order response from admin
purchaseRouter.put("/purchase/:id", async (req, res) => {
  const purchase = {
    user_id: req.body.user_id,
    quantity: req.body.quantity,
    description: req.body.description,
    receipt_email: req.body.receipt_email,
    accept: req.body.accept,
    reject_note: req.body.reject_note
  };

  try {
    const purchases = await Purchase.updatePurchase(purchase, req.params.id);
    res.json(purchases);
  } catch (err) {
    console.log("Update Purchase", err);
  }
});

module.exports = purchaseRouter;
