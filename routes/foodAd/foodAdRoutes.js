"use strict";

// Libraries
const foodAdRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const FoodAd = require("../../db/queries/food_ad/food_ad");
const { authenticateToken } = auth;

// GET all food ads
foodAdRouter.get("/food-ads", async (req, res) => {
  const foodAds = await FoodAd.getAllFoodAd();
  res.json(foodAds);
});

// GET all food ads based on advertiser ID
foodAdRouter.get("/food-ads/user", authenticateToken, async (req, res) => {
  const foodAds = await FoodAd.getUserFoodAd(req.user.id);
  res.json(foodAds);
});

// POST food ads from advertiser
foodAdRouter.post("/food-ads", authenticateToken, async (req, res) => {
  const foodAd = {
    food_ad_img_url: req.body.food_ad_img_url,
    name: req.body.name,
    ethnicity: req.body.ethnicity,
    price: req.body.price,
    quantity: req.body.quantity,
    food_ad_street_address: req.body.food_ad_street_address,
    food_ad_city: req.body.food_ad_city,
    food_ad_province_territory: req.body.food_ad_province_territory,
    food_ad_postal_code: req.body.food_ad_postal_code,
    date: req.body.date,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    vegetarian: req.body.vegetarian,
    vegan: req.body.vegan,
    gluten_free: req.body.gluten_free,
    halal: req.body.halal,
    description: req.body.description,
    food_ad_code: req.body.food_ad_code,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    phone_number: req.body.phone_number,
    food_handler_certificate: req.body.food_handler_certificate,
    date_of_issue: req.body.date_of_issue,
    expiry_date: req.body.expiry_date,
    verified: req.body.verified,
    profile_img_url: req.body.profile_img_url,
    business_street_address: req.body.business_street_address,
    business_city: req.body.business_city,
    business_province_territory: req.body.business_province_territory,
    business_postal_code: req.body.business_postal_code,
    facebook: req.body.facebook,
    twitter: req.body.twitter,
    instagram: req.body.instagram,
    youtube: req.body.youtube,
    linkedin: req.body.linkedin,
    website: req.body.website,
    bio: req.body.bio
  };

  try {
    const foodAds = await FoodAd.createFoodAd(foodAd, req.user.id);
    res.json(foodAds);
  } catch (err) {
    res.json(err);
  }
});

// PUT food ads from advertiser for quantity
foodAdRouter.put("/food-ads/quantity/:id", async (req, res) => {
  const foodAd = {
    quantity: req.body.quantity
  };

  try {
    const foodAds = await FoodAd.updateFoodAdQuantity(foodAd, req.params.id);
    res.json(foodAds);
  } catch (err) {
    console.log("Update Food Ad Quantity", err);
  }
});

// PUT food ads feedback from advertiser public or private (global)
foodAdRouter.put("/food-ads/feedback-public-global/:id", async (req, res) => {
  const foodAd = {
    feedback_public_global: req.body.feedback_public_global,
    feedback_public_local: req.body.feedback_public_local
  };

  try {
    const foodAds = await FoodAd.updateFoodAdFeedbackPublicGlobal(
      foodAd,
      req.params.id
    );
    res.json(foodAds);
  } catch (err) {
    console.log("Update Food Ad Feedback Public (Global)", err);
  }
});

// PUT food ads feedback from advertiser public or private (local)
foodAdRouter.put("/food-ads/feedback-public-local/:id", async (req, res) => {
  const foodAd = {
    feedback_public_local: req.body.feedback_public_local
  };

  try {
    const foodAds = await FoodAd.updateFoodAdFeedbackPublicLocal(
      foodAd,
      req.params.id
    );
    res.json(foodAds);
  } catch (err) {
    console.log("Update Food Ad Feedback Public (Local)", err);
  }
});

// DELETE food ads from admin
foodAdRouter.delete("/food-ads/:id", async (req, res) => {
  try {
    const returning = await FoodAd.deleteFoodAd(req.params.id);
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

module.exports = foodAdRouter;
