"use strict";

const router = require("express").Router();
// const token_service = require("../../services/authentication/token");
const food_sample_claim_service = require("../../services/food_sample_claim/food_sample_claim");
const user_profile_service = require("../../services/profile/user_profile");
const food_sample_service = require("../../services/food_sample/food_sample");

router.post(
  "/food-sample-claim",
  async (req, res) => {
    if (!req.body.food_sample_claim_user || !req.body.food_sample_id) {
      return res.status(403).json({
        success: false,
        message: "Required Parameters are not available in request",
      });
    }

    try {
      const user_details_from_db = await user_profile_service.getUserByEmailWithSubscription(
        req.body.food_sample_claim_user
      );
      if (!user_details_from_db.user.user_subscription_id) {
        return res.status(403).json({
          success: false,
          message: "Email not found for user subscription. Enter new email or buy a festival pass"
        });
      }

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }
      let db_user = user_details_from_db.user;

      const food_sample_details_from_db = await food_sample_service.getFoodSampleById(
        req.body.food_sample_id
      );
      if (!food_sample_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: food_sample_details_from_db.message,
        });
      }
      let db_food_sample = food_sample_details_from_db.food_sample;

      const food_sample_claim_details = {
        food_sample_claim_email: db_user.email,
        food_sample_claim_user_id: db_user.tasttlig_user_id,
        food_sample_id: db_food_sample.food_sample_id,
      };

      const response = await food_sample_claim_service.createNewFoodSampleClaim(
        db_user,
        db_food_sample,
        food_sample_claim_details
      );
      return res.send(response);
    } catch (err) {
      res.send({
        success: false,
        message: "Email not found for user subscription. Enter new email or buy a festival pass.",
        response: err,
      });
    }
  }
);

module.exports = router;
