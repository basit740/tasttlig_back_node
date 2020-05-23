"use strict";

// Libraries
const catererRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Caterer = require("../../db/queries/caterer/caterer");
const { authenticateToken } = auth;

// GET all caterers
catererRouter.get("/caterers", async (req, res) => {
  const caterers = await Caterer.getAllCaterer();
  res.json(caterers);
});

// POST caterer
catererRouter.post("/caterers", authenticateToken, async (req, res) => {
  const caterer = {
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
    const caterers = await Caterer.createCaterer(caterer, req.user.id);
    res.json(caterers);
  } catch (err) {
    res.json(err);
  }
});

module.exports = catererRouter;
