"use strict";

// Libraries
const chefRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Chef = require("../../db/queries/chef/chef");
const { authenticateToken } = auth;

// GET all chefs
chefRouter.get("/chefs", async (req, res) => {
  const chefs = await Chef.getAllChef();
  res.json(chefs);
});

// POST chef
chefRouter.post("/chefs", authenticateToken, async (req, res) => {
  const chef = {
    profile_img_url: req.body.profile_img_url,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    phone_number: req.body.phone_number,
    profile_type: req.body.profile_type,
    food_business_license: req.body.food_business_license,
    food_business_license_date_of_issue:
      req.body.food_business_license_date_of_issue,
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
    const chefs = await Chef.createChef(chef, req.user.id);
    res.json(chefs);
  } catch (err) {
    res.json(err);
  }
});

// PUT accept or reject commercial member applicant from admin
chefRouter.put("/chefs/:id", async (req, res) => {
  const chef = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    certified: req.body.certified,
    reject_note: req.body.reject_note
  };

  try {
    const chefs = await Chef.updateChef(chef, req.params.id);
    res.json(chefs);
  } catch (err) {
    console.log("Update Chef", err);
  }
});

module.exports = chefRouter;
