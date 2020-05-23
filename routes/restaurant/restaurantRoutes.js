"use strict";

// Libraries
const restaurantRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Restaurant = require("../../db/queries/restaurant/restaurant");
const { authenticateToken } = auth;

// GET all restaurants
restaurantRouter.get("/restaurants", async (req, res) => {
  const restaurants = await Restaurant.getAllRestaurant();
  res.json(restaurants);
});

// POST restaurant
restaurantRouter.post("/restaurants", authenticateToken, async (req, res) => {
  const restaurant = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    phone_number: req.body.phone_number,
    profile_type: req.body.profile_type,
    food_business_license: req.body.food_business_license,
    food_business_license_date_of_issue:
      req.body.food_business_license_date_of_issue,
    food_business_license_expiry_date:
      req.body.food_business_license_expiry_date,
    food_handler_certificate: req.body.food_handler_certificate,
    food_handler_certificate_date_of_issue:
      req.body.food_handler_certificate_date_of_issue,
    food_handler_certificate_expiry_date:
      req.body.food_handler_certificate_expiry_date,
    food_business_insurance: req.body.food_business_insurance,
    food_business_insurance_date_of_issue:
      req.body.food_business_insurance_date_of_issue,
    food_business_insurance_expiry_date:
      req.body.food_business_insurance_expiry_date
  };

  try {
    const restaurants = await Restaurant.createRestaurant(
      restaurant,
      req.user.id
    );
    res.json(restaurants);
  } catch (err) {
    res.json(err);
  }
});

module.exports = restaurantRouter;
