"use strict";

// Libraries
const guestRouter = require("express").Router();
const Guest = require("../../db/queries/guest/guest");

// Use Stripe secret key
// const keySecret = process.env.STRIPE_SECRET_KEY;
// const stripe = require("stripe")(keySecret);
// require("dotenv").config();

// GET all guests purchasing food ad
guestRouter.get("/guests", async (req, res) => {
  const guests = await Guest.getAllGuest();
  res.json(guests);
});

// POST guests purchasing food ad
guestRouter.post("/guests", async (req, res) => {
  // const charge = await stripe.charges.create({
  //   amount: req.body.cost,
  //   currency: "cad",
  //   description: req.body.description,
  //   receipt_email: req.body.email,
  //   source: req.body.token
  // });

  // if (charge) {
  const guest = {
    food_ad_id: req.body.food_ad_id,
    food_ad_img_url: req.body.food_ad_img_url,
    guest_email: req.body.guest_email,
    // quantity: req.body.quantity,
    description: req.body.description,
    cost: req.body.cost,
    food_ad_street_address: req.body.food_ad_street_address,
    food_ad_city: req.body.food_ad_city,
    food_ad_province_territory: req.body.food_ad_province_territory,
    food_ad_postal_code: req.body.food_ad_postal_code,
    food_ad_code: req.body.food_ad_code,
    food_ad_email: req.body.food_ad_email,
    // receipt_url: charge.receipt_url,
    // fingerprint: charge.payment_method_details.card.fingerprint
    claimed: req.body.claimed
  };

  try {
    const guests = await Guest.createGuest(guest);
    res.json(guests);
  } catch (err) {
    res.json(err);
  }
  // }
});

// PUT guest's food ad purchase response from advertiser
guestRouter.put("/guests/:id", async (req, res) => {
  const guest = {
    guest_email: req.body.guest_email,
    description: req.body.description,
    food_ad_street_address: req.body.food_ad_street_address,
    food_ad_city: req.body.food_ad_city,
    food_ad_province_territory: req.body.food_ad_province_territory,
    food_ad_postal_code: req.body.food_ad_postal_code,
    food_ad_code: req.body.food_ad_code,
    food_ad_email: req.body.food_ad_email,
    redeemed: req.body.redeemed
  };

  try {
    const guests = await Guest.updateGuest(guest, req.params.id);
    res.json(guests);
  } catch (err) {
    console.log("Update Guest", err);
  }
});

// DELETE guest when signing up for a Kodede account
guestRouter.delete("/guests/:id", async (req, res) => {
  try {
    const returning = await Guest.deleteGuest(req.params.id);
    res.send({
      success: true,
      message: "ok",
      response: returning
    });
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err
    });
  }
});

module.exports = guestRouter;
