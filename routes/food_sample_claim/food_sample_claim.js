"use strict";

const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const food_sample_claim_service = require("../../services/food_sample_claim/food_sample_claim");
const user_profile_service = require("../../services/profile/user_profile");

router.post(
  "/food-sample-claim",
  token_service.authenticateToken,
  async (req, res) => {
    if (!req.body.food_sample_claim_email || !req.body.food_sample_id) {
      return res.status(403).json({
        success: false,
        message: "Required Parameters are not available in request",
      });
    }

    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );
      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }
      let db_user = user_details_from_db.user;
      const food_sample_claim_details = {
        food_sample_claim_email: req.body.food_sample_claim_email,
        food_sample_id: req.body.food_sample_id,
      };
      const response = await food_sample_claim_service.createNewFoodSampleClaim(
        db_user,
        food_sample_claim_details
      );
      return res.send(response);
    } catch (err) {
      res.send({
        success: false,
        message: "error",
        response: err,
      });
    }
  }
);

module.exports = router;
