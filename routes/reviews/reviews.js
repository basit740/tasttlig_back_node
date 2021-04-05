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
    if (
      !req.body.foodTaste ||
      !req.body.authenticity ||
      !req.body.service ||
      !req.body.transit ||
      !req.body.appearance ||
      !req.body.finalScore
    ) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

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
        review_product_id: req.body.product_id ? req.body.product_id : null,
        review_service_id: req.body.service_id ? req.body.service_id : null,
        review_experience_id: req.body.experience_id
          ? req.body.experience_id
          : null,
        review_festival_id: req.body.festival_id ? req.body_festival_id : null,
        review_status: "REVIEWED",
        review_ask_count: 1,
        authenticity_of_food_rating: req.body.authenticity,
        location_accessibility_rating: req.body.transit,
        overall_service_of_restauant_rating: req.body.service,
        overall_user_experience_rating: req.body.finalScore,
        taste_of_food_rating: req.body.foodTaste,
        venue_ambience_rating: req.body.appearance,
        additional_comments: req.body.additionalInfo,
        review_date_time: new Date(),
      };
      let result = "";
      const response = await reviews_service.updateReview(
        user_details_from_db,
        review_information
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

module.exports = router;