"use strict";

const router = require('express').Router();
const token_service = require("../../services/authentication/token");
const food_sample_service = require("../../services/food_sample/food_sample");
const user_profile_service = require("../../services/profile/user_profile");

router.post("/food-sample/add", token_service.authenticateToken, async (req, res) => {
  if (!req.body.title || !req.body.start_date || !req.body.end_date || !req.body.start_time
    || !req.body.end_time || !req.body.description || !req.body.address || !req.body.city
    || !req.body.state || !req.body.country || !req.body.postal_code || !req.body.images) {
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
      food_sample_creater_user_id: db_user.tasttlig_user_id,
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
      postal_code: req.body.postal_code
    }
    const response = await food_sample_service.createNewFoodSample(db_user, food_sample_details, req.body.images);
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err
    });
  }
});

router.get("/food-sample/all", async (req, res) => {
  try{
    const status_operator = "=";
    const food_sample_status = "ACTIVE";
    const response = await food_sample_service.getAllFoodSamples(status_operator, food_sample_status);
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err.message
    });
  }
});

router.get("/food-sample/user/all", token_service.authenticateToken, async (req, res) => {
  try{
    const status_operator = "!=";
    const food_sample_status = "ARCHIVED";
    const response = await food_sample_service.getAllUserFoodSamples(req.user.id, status_operator, food_sample_status);
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err.message
    });
  }
});

router.get("/food-sample/owner/:owner_id", async (req, res) => {
  if (!req.params.owner_id) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try{
    const status_operator = "=";
    const food_sample_status = "ACTIVE";
    const food_sample_response = await food_sample_service.getAllUserFoodSamples(req.params.owner_id, status_operator, food_sample_status);
    const db_food_samples = food_sample_response.details;
    const user_details_response = await user_profile_service.getUserById(req.params.owner_id);
    if(!user_details_response.success) {
      return res.status(403).json({
        success: false,
        message: user_details_response.message
      });
    }
    const db_user = user_details_response.user;
    return res.send({
      success: true,
      owner_user: db_user,
      food_samples: db_food_samples
    });
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err.message
    });
  }
});

router.get("/food-sample/user/archived", token_service.authenticateToken, async (req, res) => {
  try{
    const status_operator = "=";
    const food_sample_status = "ARCHIVED";
    const response = await food_sample_service.getAllUserFoodSamples(req.user.id, status_operator, food_sample_status);
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err.message
    });
  }
});

router.put("/food-sample/update/:food_sample_id", token_service.authenticateToken, async (req, res) => {
  if(!req.params.food_sample_id || !req.body.food_sample_update_data){
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try {
    const user_details_response = await user_profile_service.getUserById(req.params.owner_id);
    if(!user_details_response.success) {
      return res.status(403).json({
        success: false,
        message: user_details_response.message
      });
    }
    const db_user = user_details_response.user;
    const response = await food_sample_service.updateFoodSample(
      db_user,
      req.params.food_sample_id,
      req.body.food_sample_update_data
    );
    return res.send(response);
  } catch (e) {
    res.send({
      success: false,
      message: "error",
      response: e.message
    });
  }
});

router.delete("/food-sample/delete/:food_sample_id", token_service.authenticateToken, async (req, res) => {
  if(!req.params.food_sample_id){
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try {
    const response = await food_sample_service.deleteFoodSample(req.user.id, req.params.food_sample_id);
    return res.send(response);
  } catch (e) {
    res.send({
      success: false,
      message: "error",
      response: e.message
    });
  }
});

module.exports = router;