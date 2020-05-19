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
    first_name: req.body.firstName,
    last_name: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    city: req.body.city,
    business_city: req.body.businesscity,
    state: req.body.state,
    country: req.body.country,
    postal_code: req.body.postalCode,
    registration_number: req.body.registrationNumber,
    facebook: req.body.facebook,
    instagram: req.body.instagram,
    yelp_reviews: req.body.yelpReviews,
    google_review: req.body.googleReview,
    tripAdviser_review: req.body.tripAdviserReview,
    instagram_review: req.body.instagramReview,
    youtube_review: req.body.youtubeReview,
    media_recognition: req.body.mediaRecognition,
    host_selection: req.body.hostSelection,
    host_selection_video: req.body.hostSelectionVideo,
    banking: req.body.Banking,
    business_type: req.body.businesstype,
    online_email: req.body.onlineEmail,
    payPal_email: req.body.payPalEmail,
    stripe_account: req.body.stripeAccount,
    culture: req.body.culture,
    business_name: req.body.businessName,
    cultures_to_explore: req.body.culturesToExplore,
    insurance: req.body.Insurance,
    insurance_file: req.body.insuranceFile,
    address_line_1: req.body.addressline1,
    address_line_2: req.body.addressline2,
    health_safety_certificate: req.body.Health,
    food_handler_certificate: req.body.foodHandler,
    bankNumber: req.body.bankNumber,
    accountNumber: req.body.accountNumber,
    institutionNumber: req.body.institutionNumber,
    voidCheque: req.body.voidCheque
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
