"use strict";

// Libraries
const foodTruckRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const FoodTruck = require("../../db/queries/food_truck/food_truck");
const { authenticateToken } = auth;

// GET all food trucks
foodTruckRouter.get("/food-trucks", async (req, res) => {
  const foodTrucks = await FoodTruck.getAllFoodTruck();
  res.json(foodTrucks);
});

// POST food truck
foodTruckRouter.post("/food-trucks", authenticateToken, async (req, res) => {
  const foodTruck = {
    profile_img_url: req.body.profile_img_url,
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
      req.body.food_business_insurance_expiry_date,
    certified: req.body.certified
  };

  try {
    const foodTrucks = await FoodTruck.createFoodTruck(foodTruck, req.user.id);
    res.json(foodTrucks);
  } catch (err) {
    res.json(err);
  }
});

// PUT accept or reject commercial member applicant from admin
foodTruckRouter.put("/food-trucks/:id", async (req, res) => {
  const foodTruck = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    certified: req.body.certified,
    reject_note: req.body.reject_note
  };

  try {
    const foodTrucks = await FoodTruck.updateFoodTruck(
      foodTruck,
      req.params.id
    );
    res.json(foodTrucks);
  } catch (err) {
    console.log("Update Food Truck", err);
  }
});

module.exports = foodTruckRouter;
