"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const user_profile_service = require("../../services/profile/user_profile");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const service_claim_service = require("../services/services");

// POST service claim
router.post("/all-services-claim", async (req, res) => {
  if (!req.body.food_sample_claim_user || !req.body.food_sample_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  let db_user;
  let new_user = false;
  const claimed_total_quantity = req.body.claimed_total_quantity;

  db_user = await user_profile_service.getUserByPassportIdOrEmail(
    req.body.food_sample_claim_user
  );

  if (!db_user.success) {
    // Check if input is an email
    if (req.body.food_sample_claim_user.includes("@")) {
      db_user = await authenticate_user_service.createDummyUser(
        req.body.food_sample_claim_user
      );
      new_user = true;
    } else {
      res.send({
        success: false,
        message: "Entered Passport ID is invalid.",
      });
    }
  }

  db_user = db_user.user;

  try {
    if (!new_user) {
      const {
        canClaim,
        message,
        error,
      } = await service_claim_service.userCanClaimService(
        db_user.email,
        req.body.food_sample_id
      );

      if (!canClaim) {
        return res.status(error ? 500 : 200).json({
          success: false,
          message,
          error,
        });
      }

      const user_details_from_db = await user_profile_service.getUserByEmailWithSubscription(
        db_user.email
      );

      if (!canClaim && !user_details_from_db.user.user_subscription_id) {
        return res.status(403).json({
          success: false,
          message:
            "Email not found for user subscription. Enter new email or buy a festival pass.",
        });
      }
    }
    const product_details_from_db = await service_claim_service.findService(
      req.body.food_sample_id
    );

    if (!product_details_from_db.success) {
      return res.status(403).json({
        success: false,
        message: product_details_from_db.message,
      });
    }
    let db_all_products = product_details_from_db.details;
    const product_claim_details = {
      user_claim_email: db_user.email,
      claim_user_id: db_user.tasttlig_user_id,
      claimed_service_id: db_all_products.service_id,
      current_stamp_status: "Claimed",
      claimed_quantity: req.body.claimed_quantity,
      claim_viewable_id: req.body.claim_viewable_id,
      festival_name: req.body.foodsample_festival_name,
      reserved_on: new Date(),
      festival_id: req.body.festival_id,
    };
    const response = await service_claim_service.createNewServiceClaim(
      db_user,
      db_all_products,
      claimed_total_quantity,
      product_claim_details
    );
    return res.send(response);
  } catch (error) {
    console.log("error", error);
    res.send({
      success: false,
      message:
        "Email not found for user subscription. Enter new email or buy a festival pass.",
      response: error,
    });
  }
});

module.exports = router;
