"use strict";

const router = require('express').Router();
const token_service = require("../../services/authentication/token");
const experience_service = require("../../services/experience/experience");
const user_profile_service = require("../../services/profile/user_profile");

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
    const db_user = user_details_from_db.user;
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
    const response = await experience_service.createNewExperience(db_user, experience_details, req.body.images);
    console.log(response);
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err
    });
  }
});

router.get("/experience/user/all", token_service.authenticateToken, async (req, res) => {
  try{
    const user_details_from_db = await user_profile_service.getUserById(req.user.id);
    if(!user_details_from_db.success) {
      return res.status(403).json({
        success: false,
        message: user_details_from_db.message
      });
    }
    const db_user = user_details_from_db.user;
    const status_operator = "!=";
    const experience_status = "ARCHIVED";
    const response = await experience_service.getAllUserExperience(db_user, status_operator, experience_status);
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
    const response = await experience_service.updateExperience(
      req.user.id,
      req.params.experience_id,
      req.body.experience_update_data);
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