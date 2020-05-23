"use strict";

// Libraries
const cookRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Cook = require("../../db/queries/cook/cook");
const { authenticateToken } = auth;

// GET all cooks
cookRouter.get("/cooks", async (req, res) => {
  const cooks = await Cook.getAllCook();
  res.json(cooks);
});

// POST cook
cookRouter.post("/cooks", authenticateToken, async (req, res) => {
  const cook = {
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
    const cooks = await Cook.createCook(cook, req.user.id);
    res.json(cooks);
  } catch (err) {
    res.json(err);
  }
});

module.exports = cookRouter;
