"use strict";

const router = require('express').Router();
const token_service = require("../../services/authentication/token");
const food_sample_service = require("../../services/food_sample/food_sample");
const user_profile_service = require("../../services/profile/user_profile");
const user_role_manager = require("../../services/profile/user_roles_manager");

router.post("/food-sample/add", token_service.authenticateToken, async (req, res) => {
  if (!req.body.title || !req.body.start_date || !req.body.end_date || !req.body.start_time
    || !req.body.end_time || !req.body.frequency || !req.body.description || !req.body.address || !req.body.city
    || !req.body.state || !req.body.country || !req.body.postal_code || !req.body.nationality_id || !req.body.images) {
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
    let createdByAdmin = false;
    let db_user = user_details_from_db.user;
    let user_role_object = user_role_manager.createRoleObject(db_user.role);
    if (user_role_object.includes("ADMIN")){
      if (!req.body.userEmail) {
        return res.status(403).json({
          success: false,
          message: "Required Parameters are not available in request"
        });
      }
      const host_details_from_db = await user_profile_service.getUserByEmail(req.body.userEmail);
      db_user = host_details_from_db.user;
      createdByAdmin = true;
    }
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
      postal_code: req.body.postal_code,
      nationality_id: req.body.nationality_id,
      frequency: req.body.frequency
    }
    const response = await food_sample_service.createNewFoodSample(
      db_user,
      food_sample_details,
      req.body.images,
      createdByAdmin
    );
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
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || ""
    const status_operator = "=";
    const food_sample_status = "ACTIVE";
    const food_ad_code = req.query.food_ad_code
    const filters = {
      nationalities: req.query.nationalities,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    }

    const response = await food_sample_service.getAllFoodSamples(status_operator, food_sample_status, keyword, current_page, food_ad_code, filters);

    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err.message
    });
  }
});

router.get("/food-sample/nationalities", async (req, res) => {
  try {
    const status_operator = "=";
    const food_sample_status = "ACTIVE";
    const response = await food_sample_service.getDistinctNationalities(status_operator, food_sample_status);
    return res.send(response);
  } catch (e) {
    res.send({
      success: false,
      message: "error",
      response: e.message
    });
  }
});

router.get("/food-sample/:food_sample_id", async (req, res) => {
  if (!req.params.food_sample_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request."
    });
  }
  try {
    const response = await food_sample_service.getFoodSample(req.params.food_sample_id);
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
    const user_details_from_db = await user_profile_service.getUserById(req.user.id);
    if(!user_details_from_db.success) {
      return res.status(403).json({
        success: false,
        message: user_details_from_db.message
      });
    }
    let requestByAdmin = false;
    let db_user = user_details_from_db.user;
    let user_role_object = user_role_manager.createRoleObject(db_user.role);
    if (user_role_object.includes("ADMIN")){
      requestByAdmin = true;
    }
    const response = await food_sample_service.getAllUserFoodSamples(
      req.user.id,
      status_operator,
      food_sample_status,
      requestByAdmin
    );
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
    const user_details_from_db = await user_profile_service.getUserById(req.user.id);
    if(!user_details_from_db.success) {
      return res.status(403).json({
        success: false,
        message: user_details_from_db.message
      });
    }
    let requestByAdmin = false;
    let db_user = user_details_from_db.user;
    let user_role_object = user_role_manager.createRoleObject(db_user.role);
    if (user_role_object.includes("ADMIN")){
      requestByAdmin = true;
    }
    const response = await food_sample_service.getAllUserFoodSamples(
      req.user.id,
      status_operator,
      food_sample_status,
      requestByAdmin
    );
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err.message
    });
  }
});

router.put("/food-sample/review", token_service.verifyTokenForReview, async (req, res) => {
  if (!req.body.food_sample_update_data) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request."
    });
  }
  try {
    const response = await food_sample_service.updateReviewFoodSample(
      req.details.id,
      req.details.user_id,
      req.body.food_sample_update_data
    );
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
    const user_details_response = await user_profile_service.getUserById(req.user.id);
    if(!user_details_response.success) {
      return res.status(403).json({
        success: false,
        message: user_details_response.message
      });
    }
    let updatedByAdmin = false;
    let db_user = user_details_response.user;
    let user_role_object = user_role_manager.createRoleObject(db_user.role);
    if (user_role_object.includes("ADMIN")){
      updatedByAdmin = true;
    }
    const response = await food_sample_service.updateFoodSample(
      db_user,
      req.params.food_sample_id,
      req.body.food_sample_update_data,
      updatedByAdmin
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