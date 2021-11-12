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
      req.body.comment
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

module.exports = router;
