"use strict";

// Libraries
const foodAdRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const FoodAd = require("../../db/queries/food_ad/food_ad");
const { authenticateToken } = auth;

// GET all food ads
foodAdRouter.get("/food-ad", async (req, res) => {
  const foodAds = await FoodAd.getAllFoodAd();
  res.json(foodAds);
});

// GET all food ads based on user ID
foodAdRouter.get("/food-ad/user", authenticateToken, async (req, res) => {
  const foodAds = await FoodAd.getUserFoodAd(req.user.id);
  res.json(foodAds);
});

// POST food ad
foodAdRouter.post("/food-ad", authenticateToken, async (req, res) => {
  const foodAd = {
    food_ad_img_url: req.body.food_ad_img_url,
    name: req.body.name,
    incentive: req.body.incentive,
    price: req.body.price,
    quantity: req.body.quantity,
    food_ad_street_address: req.body.food_ad_street_address,
    food_ad_city: req.body.food_ad_city,
    food_ad_province_territory: req.body.food_ad_province_territory,
    food_ad_postal_code: req.body.food_ad_postal_code,
    spice_level: req.body.spice_level,
    vegetarian: req.body.vegetarian,
    vegan: req.body.vegan,
    gluten_free: req.body.gluten_free,
    halal: req.body.halal,
    ready_time: req.body.ready_time,
    ready_time_type: req.body.ready_time_type,
    expiry_time: req.body.expiry_time,
    expiry_time_type: req.body.expiry_time_type,
    description: req.body.description,
    food_ad_code: req.body.food_ad_code,
    food_ad_active: req.body.food_ad_active
  };

  try {
    const foodAds = await FoodAd.createFoodAd(foodAd, req.user.id);
    res.json(foodAds);
  } catch (err) {
    res.json(err);
  }
});

module.exports = foodAdRouter;
