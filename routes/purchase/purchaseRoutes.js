"use strict";

// Libraries
const purchaseRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Purchase = require("../../db/queries/purchase/purchase");
const { authenticateToken } = auth;

// Use Stripe secret key
// const keySecret = process.env.STRIPE_SECRET_KEY;
// const stripe = require("stripe")(keySecret);
// require("dotenv").config();

// GET all food ad purchases
purchaseRouter.get("/purchases", async (req, res) => {
  const purchases = await Purchase.getAllPurchase();
  res.json(purchases);
});

// GET all food ad purchases based on user ID
purchaseRouter.get("/purchases/user", authenticateToken, async (req, res) => {
  const purchases = await Purchase.getUserPurchase(req.user.id);
  res.json(purchases);
});

// POST food ad purchases
purchaseRouter.post("/purchases", authenticateToken, async (req, res) => {
  // const charge = await stripe.charges.create({
  //   amount: req.body.cost,
  //   currency: "cad",
  //   description: req.body.description,
  //   receipt_email: req.body.email,
  //   source: req.body.token
  // });

  // if (charge) {
  const purchase = {
    food_ad_number: req.body.food_ad_number,
    profile_img_url: req.body.profile_img_url,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    food_ad_img_url: req.body.food_ad_img_url,
    // quantity: req.body.quantity,
    description: req.body.description,
    cost: req.body.cost,
    food_ad_street_address: req.body.food_ad_street_address,
    food_ad_city: req.body.food_ad_city,
    food_ad_province_territory: req.body.food_ad_province_territory,
    food_ad_postal_code: req.body.food_ad_postal_code,
    // ready_time: req.body.ready_time,
    // ready_time_type: req.body.ready_time_type,
    // expiry_time: req.body.expiry_time,
    // expiry_time_type: req.body.expiry_time_type,
    food_ad_code: req.body.food_ad_code,
    order_ad_code: req.body.order_ad_code,
    phone_number: req.body.phone_number,
    receipt_email: req.body.receipt_email,
    // receipt_url: charge.receipt_url,
    // fingerprint: charge.payment_method_details.card.fingerprint
    claimed: req.body.claimed
  };

  try {
    const purchases = await Purchase.createPurchase(purchase, req.user.id);
    res.json(purchases);
  } catch (err) {
    res.json(err);
  }
  // }
});

// PUT food ad purchase response from advertiser
purchaseRouter.put("/purchases/:id", async (req, res) => {
  const purchase = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    description: req.body.description,
    food_ad_street_address: req.body.food_ad_street_address,
    food_ad_city: req.body.food_ad_city,
    food_ad_province_territory: req.body.food_ad_province_territory,
    food_ad_postal_code: req.body.food_ad_postal_code,
    food_ad_code: req.body.food_ad_code,
    receipt_email: req.body.receipt_email,
    claimed: req.body.claimed,
    redeemed: req.body.redeemed
  };

  try {
    const purchases = await Purchase.updatePurchase(purchase, req.params.id);
    res.json(purchases);
  } catch (err) {
    console.log("Update Purchase", err);
  }
});

module.exports = purchaseRouter;
