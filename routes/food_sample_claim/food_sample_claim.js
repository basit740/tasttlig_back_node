"use strict";

const router = require("express").Router();
// const token_service = require("../../services/authentication/token");
const food_sample_claim_service = require("../../services/food_sample_claim/food_sample_claim");
const user_profile_service = require("../../services/profile/user_profile");
const food_sample_service = require("../../services/food_sample/food_sample");
const authenticate_user_service = require("../../services/authentication/authenticate_user");

router.post(
  "/food-sample-claim",
  async (req, res) => {
    if (!req.body.food_sample_claim_user || !req.body.food_sample_id) {
      return res.status(403).json({
        success: false,
        message: "Required Parameters are not available in request",
      });
    }
    let db_user;
    let new_user = false;
    db_user = await user_profile_service.getUserByPassportIdOrEmail(req.body.food_sample_claim_user);
    if(!db_user.success) {
      //check if input is an email
      if(req.body.food_sample_claim_user.includes("@")) {
        db_user = await authenticate_user_service.createDummyUser(req.body.food_sample_claim_user);
        new_user = true;
      } else {
        res.send({
          success: false,
          message: "Entered Passport Id is Invalid"
        });
      }
    }
    db_user = db_user.user;
    
    try {
      if(!new_user){
        const {canClaim, message, error} = await food_sample_claim_service
          .userCanClaimFoodSample(db_user.email, req.body.food_sample_id)
  
        if (!canClaim) {
          return res.status(error ? 500 : 200).json({
            success: false,
            message,
            error
          })
        }
      
        const user_details_from_db = await user_profile_service.getUserByEmailWithSubscription(
          db_user.email
        );
        if (!canClaim && !user_details_from_db.user.user_subscription_id) {
          return res.status(403).json({
            success: false,
            message: "Email not found for user subscription. Enter new email or buy a festival pass"
          });
        }
      }
      
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
        food_sample_id: db_food_sample.food_sample_id
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

router.post(
  "/food-sample-claim/confirm",
  async (req, res) => {
    if (!req.body.token) {
      return res.status(403).json({
        success: false,
        message: "Token not present in request",
      });
    }
    
    const response = await food_sample_claim_service.confirmFoodSampleClaim(req.body.token);
    
    return res.status(response.error ? 500:200).json(response);
  });

module.exports = router;
