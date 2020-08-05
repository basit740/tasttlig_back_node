"use strict";

const router = require('express').Router();
const token_service = require("../../services/authentication/token");
const food_sample_service = require("../../services/food_sample/food_sample");
const user_profile_service = require("../../services/profile/user_profile");

router.post("/food-sample/add", token_service.authenticateToken, async (req, res) => {
  if (!req.body.title || !req.body.start_date || !req.body.end_date || !req.body.start_time
    || !req.body.end_time || !req.body.description || !req.body.address
    || !req.body.city || !req.body.state || !req.body.country || !req.body.postal_code
    || !req.body.image) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try{
    const user_details_from_db = await user_profile_service.getUserById(req.user.id);
    if(!user_details_from_db.success) {
      return res.status(403).json({
        success: false,
        message: user_details_from_db.message
      });
    }
    const db_user = user_details_from_db.user;
    const food_sample_details = {
      title: req.body.title,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      description: req.body.description,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      postal_code: req.body.postal_code,
      image_url: req.body.image
    }
    const response = await food_sample_service.createNewFoodSample(db_user, food_sample_details);
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err
    });
  }
});

module.exports = router;