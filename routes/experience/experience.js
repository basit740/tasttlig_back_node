"use strict";

const router = require('express').Router();
const token_service = require("../../services/authentication/token");
const experience_service = require("../../services/experience/experience");
const user_profile_service = require("../../services/profile/user_profile");
const user_role_manager = require("../../services/profile/user_roles_manager");

router.post("/experience/add", token_service.authenticateToken, async (req, res) => {
  if (!req.body.title || !req.body.price || !req.body.category || !req.body.style
    || !req.body.start_date || !req.body.end_date || !req.body.start_time || !req.body.end_time
    || !req.body.capacity || !req.body.dress_code || !req.body.description || !req.body.address
    || !req.body.city || !req.body.state || !req.body.country || !req.body.postal_code
    || !req.body.images) {
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
    const experience_details = {
      experience_creator_user_id: db_user.tasttlig_user_id,
      title: req.body.title,
      price: req.body.price,
      category: req.body.category,
      style: req.body.style,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      capacity: req.body.capacity,
      dress_code: req.body.dress_code,
      description: req.body.description,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      postal_code: req.body.postal_code
    }
    const response = await experience_service.createNewExperience(
      db_user,
      experience_details,
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

router.get("/experience/all", async (req, res) => {
  try {
    const response = await experience_service.getAllExperience();
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err.message
    });
  }
});

router.get("/experience/user/all", token_service.authenticateToken, async (req, res) => {
  try{
    const status_operator = "!=";
    const experience_status = "ARCHIVED";
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
    const response = await experience_service.getAllUserExperience(
      req.user.id,
      status_operator,
      experience_status,
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

router.get("/experience/user/archived", token_service.authenticateToken, async (req, res) => {
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
      if (!req.body.userEmail) {
        return res.status(403).json({
          success: false,
          message: "Required Parameters are not available in request"
        });
      }
      requestByAdmin = true;
    }
    const response = await experience_service.getAllUserExperience(
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

router.put("/experience/review/:experience_id", async (req, res) => {
  if (!req.params.experience_id || !req.body.experience_update_data) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request."
    });
  }
  try {
    const response = await experience_service.updateReviewExperience(
      req.params.experience_id,
      req.body.experience_update_data
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

router.put("/experience/update/:experience_id", token_service.authenticateToken, async (req, res) => {
  if(!req.params.experience_id || !req.body.experience_update_data){
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try {
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
      createdByAdmin = true;
    }
    const response = await experience_service.updateExperience(
      db_user,
      req.params.experience_id,
      req.body.experience_update_data,
      createdByAdmin);
    return res.send(response);
  } catch (e) {
    res.send({
      success: false,
      message: "error",
      response: e.message
    });
  }
});

router.delete("/experience/delete/:experience_id", token_service.authenticateToken, async (req, res) => {
  if(!req.params.experience_id){
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try {
    const response = await experience_service.deleteExperience(req.user.id, req.params.experience_id);
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