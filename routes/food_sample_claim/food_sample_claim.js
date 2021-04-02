"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const food_sample_claim_service = require("../../services/food_sample_claim/food_sample_claim");
const user_profile_service = require("../../services/profile/user_profile");
const food_sample_service = require("../../services/food_sample/food_sample");
const authenticate_user_service = require("../../services/authentication/authenticate_user");

// POST food sample claim
router.post("/all-products-claim", async (req, res) => {
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
      } = await food_sample_claim_service.userCanClaimFoodSample(
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
    const product_details_from_db = await food_sample_service.getProductById(
      req.body.food_sample_id
    );

    if (!product_details_from_db.success) {
      return res.status(403).json({
        success: false,
        message: product_details_from_db.message,
      });
    }
    let db_all_products = product_details_from_db.food_sample;

    const product_claim_details = {
      user_claim_email: db_user.email,
      claim_user_id: db_user.tasttlig_user_id,
      claimed_product_id: db_all_products.product_id,
      current_stamp_status: "Claimed",
      claimed_quantity: req.body.claimed_quantity,
      claim_viewable_id: req.body.claim_viewable_id,
      festival_name: req.body.foodsample_festival_name,
      
    };

    const response = await food_sample_claim_service.createNewFoodSampleClaim(
      db_user,
      db_all_products,
      claimed_total_quantity,
      product_claim_details
    );
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message:
        "Email not found for user subscription. Enter new email or buy a festival pass.",
      response: error,
    });
  }
});

// POST confirm product redeem status
router.post("/all-products-claim/confirm", async (req, res) => {
  if (!req.body.claim_viewable_id) {
    return res.status(403).json({
      success: false,
      message: "Id not present in request.",
    });
  }
  const response = await food_sample_claim_service.confirmProductClaim(
    req.body.claim_viewable_id,
    req.body.quantity,
    req.body.redeemed_total_quantity,
    );

  return res.status(response.error ? 500 : 200).json(response);
});

// GET user food sample claim
router.get(
  "/all-product-claim/user/reservations",
  token_service.authenticateToken,
  async (req, res) => {

    try {
      const db_food_claims = await food_sample_claim_service.getUserProductsClaims(
        req.user.id
      );

      return res.send(db_food_claims);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

// GET Host food sample Redeems
router.get(
  "/all-product-redeem/user/reservations",
  token_service.authenticateToken,
  async (req, res) => {
    const keyword = req.query.keyword || "";
    try {
      const db_food_claims = await food_sample_claim_service.getUserProductsRedeems(
        req.user.id,
        keyword
      );
      return res.send(db_food_claims);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

module.exports = router;
