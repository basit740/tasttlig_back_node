"use strict";
// Libraries
const router = require("express").Router();
// const token_service = require("../../services/authentication/token");
const festival_reviews_service = require("../../services/festival_reviews/festival_reviews");

// add review to festival_reviews table
router.post("/festival-reviews", async (req, res) => {
  try {
    const response = await festival_reviews_service.addToFestivalReviews(
      req.body.festival_id,
      req.body.user_id,
      req.body.first_name,
      req.body.last_name,
      req.body.rating,
      req.body.comment,
      req.body.excellence,
      req.body.excellence,
      req.body.polite,
      req.body.ethical,
      req.body.receptive,
      req.body.impressive,
      req.body.ecofriendly,
      req.body.novel,
      req.body.clean,
      req.body.enjoyable
    );
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// get reviews from festival_reviews table
router.get("/festival-reviews/:festival_id", async (req, res) => {
  if (!req.params.festival_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const response = await festival_reviews_service.getFestivalReviews(
      req.params.festival_id
    );
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// get all festival-reviews for admin
router.get("/festival-reviews-admin", async (req, res) => {
  try {
    const response = await festival_reviews_service.getFestivalReviewsAdmin();
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

module.exports = router;
