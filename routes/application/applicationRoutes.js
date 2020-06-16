"use strict";

// Libraries
const applicationRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Application = require("../../db/queries/application/application");
const { authenticateToken } = auth;

// GET all applications
applicationRouter.get("/applications", async (req, res) => {
  const applications = await Application.getAllApplication();
  res.json(applications);
});

// GET all applications based on advertiser ID
applicationRouter.get("/applications/user", async (req, res) => {
  const applications = await Application.getUserApplication(req.user.id);
  res.json(applications);
});

// POST applications from advertiser
applicationRouter.post("/applications", authenticateToken, async (req, res) => {
  const application = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    phone_number: req.body.phone_number,
    city: req.body.city,
    business_name: req.body.business_name,
    business_type: req.body.business_type,
    culture: req.body.culture,
    culture_to_explore: req.body.culture_to_explore,
    address_line_1: req.body.address_line_1,
    address_line_2: req.body.address_line_2,
    business_city: req.body.business_city,
    state: req.body.state,
    postal_code: req.body.postal_code,
    country: req.body.country,
    registration_number: req.body.registration_number,
    facebook: req.body.facebook,
    instagram: req.body.instagram,
    food_handler_certificate: req.body.food_handler_certificate,
    date_of_issue: req.body.date_of_issue,
    expiry_date: req.body.expiry_date,
    insurance: req.body.insurance,
    insurance_file: req.body.insurance_file,
    health_safety_certificate: req.body.health_safety_certificate,
    banking: req.body.banking,
    bank_number: req.body.bank_number,
    account_number: req.body.account_number,
    institution_number: req.body.institution_number,
    void_cheque: req.body.void_cheque,
    online_email: req.body.online_email,
    paypal_email: req.body.paypal_email,
    stripe_account: req.body.stripe_account,
    yelp_review: req.body.yelp_review,
    google_review: req.body.google_review,
    tripadvisor_review: req.body.tripadvisor_review,
    instagram_review: req.body.instagram_review,
    youtube_review: req.body.youtube_review,
    personal_review: req.body.personal_review,
    media_recognition: req.body.media_recognition,
    host_selection: req.body.host_selection,
    host_selection_video: req.body.host_selection_video,
    youtube_link: req.body.youtube_link
  };

  try {
    const applications = await Application.createApplication(
      application,
      req.user.id
    );
    res.json(applications);
  } catch (err) {
    res.json(err);
  }
});

module.exports = applicationRouter;
