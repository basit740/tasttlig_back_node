"use strict";

// Libraries
const applicationRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Application = require("../../db/queries/application/application");
const { authenticateToken } = auth;

// GET all Applications
applicationRouter.get("/applications", async (req, res) => {
  const applications = await Application.getAllapplication();
  res.json(applications);
});

// GET all Applications based on advertiser ID
applicationRouter.get("/applications/user", async (req, res) => {
  const applications = await Application.getUserapplication(req.user.id);
  res.json(applications);
});

// POST Applications from advertiser
applicationRouter.post("/applications", async (req, res) => {
  const application = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    phone: req.body.phone,
    city: req.body.city,
    business_city: req.body.business_city,
    state: req.body.state,
    country: req.body.country,
    postal_code: req.body.postal_code,
    registration_number: req.body.registration_number,
    facebook: req.body.facebook,
    instagram: req.body.instagram,
    yelp_reviews: req.body.yelp_reviews,
    google_review: req.body.google_review,
    tripAdviser_review: req.body.tripAdviser_review,
    instagram_review: req.body.instagram_review,
    youtube_review: req.body.youtube_review,
    media_recognition: req.body.media_recognition,
    host_selection: req.body.host_selection,
    issue_date: req.body.issue_date,
    expiry_date: req.body.expiry_date,
    host_selection_video: req.body.host_selection_video,
    banking: req.body.banking,
    business_type: req.body.business_type,
    online_email: req.body.online_email,
    payPal_email: req.body.payPal_email,
    stripe_account: req.body.stripe_account,
    culture: req.body.culture,
    business_name: req.body.business_name,
    cultures_to_explore: req.body.cultures_to_explore,
    insurance: req.body.insurance,
    insurance_file: req.body.insurance_file,
    address_line_1: req.body.address_line_1,
    address_line_2: req.body.address_line_2,
    health_safety_certificate: req.body.health_safety_certificate,
    food_handler_certificate: req.body.food_handler_certificate,
    bank_number: req.body.bank_number,
    account_number: req.body.account_number,
    institution_number: req.body.institution_number,
    void_cheque: req.body.void_cheque
  };

  console.log(application);

  try {
    console.log("Hi");
    const applications = await Application.createapplication(application);
    console.log("Hello");
    res.json(applications);
    console.log(applications);
  } catch (err) {
    res.json(err);
  }
});

module.exports = applicationRouter;
