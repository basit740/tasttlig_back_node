"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const authentication_service = require("../../services/authentication/authenticate_user");
const user_profile_service = require("../../services/profile/user_profile");
const reviews_service = require("../../services/reviews/reviews");
// POST review
router.post(
  "/reviews/add",
  token_service.authenticateToken,
  async (req, res) => {
    console.log(req.body);
    console.log(req.query);
    if (
      !req.body.tasteRating ||
      !req.body.authenticityRating ||
      !req.body.serviceRating ||
      !req.body.transitRating ||
      !req.body.environmentRating ||
      !req.body.finalScore ||
      !req.body.review_id
    ) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }
    console.log("im going thorugh");
    try {
      let user_details_from_db;
      if (req.user) {
        user_details_from_db = await user_profile_service.getUserById(
          req.user.id
        );
      } else {
        user_details_from_db = await user_profile_service.getUserByEmail(
          req.query.email
        );
      }

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }
      let business_details_from_db;
      if (req.user) {
        business_details_from_db = await authentication_service.getUserByBusinessDetails(
          req.user.id
        );
      } else {
        business_details_from_db = await authentication_service.getUserByBusinessDetails(
          user_details_from_db.user.tasttlig_user_id
        );
      }

      let db_business_details = business_details_from_db.business_details;
      console.log(req.user);
      const review_information = {
        review_user_id: req.user.id,
        review_user_email: req.user.email,
        review_service_id: req.body.service_id ? req.body.service_id : null,
        review_experience_id: req.body.experience_id
          ? req.body.experience_id
          : null,
        review_festival_id: req.body.festival_id ? req.body_festival_id : null,
        review_status: "REVIEWED",
        authenticity_of_food_rating: req.body.authenticityRating,
        location_accessibility_rating: req.body.transitRating,
        overall_service_of_restauant_rating: req.body.serviceRating,
        overall_user_experience_rating: req.body.finalScore,
        taste_of_food_rating: req.body.tasteRating,
        venue_ambience_rating: req.body.environmentRating,
        additional_comments: req.body.additionalInfo,
        review_date_time: new Date(),
      };
      let result = "";
      const response = await reviews_service.updateReview(
        user_details_from_db,
        review_information,
        req.body.review_id
      );
      if (response.success) {
        result = response;
      } else {
        return res.send({
          success: false,
          message: "Error.",
        });
      }
      return res.send(result);
    } catch (error) {
      console.log(error);
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

//Get non-reviewed from user
router.get("/reviews/user/:user_id", async (req, res) => {
  console.log(req.query.productId);
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const response = await reviews_service.getNonReviewedFromUser(
      req.params.user_id,
      req.query.productId
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
//Update popup counter
router.get(
  "/reviews/pop-up",
  token_service.authenticateToken,
  async (req, res) => {
    //console.log("params", req.params);
    //console.log("body", req.body);
    //console.log("query", req.query);
    try {
      const response = await reviews_service.updatePopUpCount(
        req.user.id,
        req.query.review_id
      );

      return res.send(response);
    } catch (error) {
      console.log(error);
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

module.exports = router;
