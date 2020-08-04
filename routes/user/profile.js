"use strict";

const router = require('express').Router();
const token_service = require("../../services/authentication/token");
const user_profile_service = require("../../services/profile/user_profile")
const user_role_manager = require("../../services/profile/user_roles_manager");

// GET user by ID
router.get("/user", token_service.authenticateToken, async (req, res) => {
  const response = await user_profile_service.getUserById(req.user.id);
  if(!response.success) {
    return res.status(403).json({
      success: false,
      message: response.message
    });
  }
  let user = {
    id: response.user.tasttlig_user_id,
    first_name: response.user.first_name,
    last_name: response.user.last_name,
    email: response.user.email,
    phone_number: response.user.phone_number,
    role: user_role_manager.createRoleObject(response.user.role),
    verified: response.user.is_email_verified
  }
  res.status(200).json({
    success: true,
    user: user
  });
});

router.post("/user/upgrade", token_service.authenticateToken, async (req, res) => {
  if (!req.body.upgrade_type || !req.body.document_type
    || !req.body.document_link || !req.body.issue_date
    || !req.body.expiry_date) {
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
    const upgrade_details = {
      upgrade_type: req.body.upgrade_type,
      document_type: req.body.document_type,
      document_link: req.body.document_link,
      issue_date: req.body.issue_date,
      expiry_date: req.body.expiry_date
    }
    const response = await user_profile_service.upgradeUser(db_user, upgrade_details);
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err
    });
  }
});

router.post("/user/upgrade/action/:token", async (req, res) => {
  if (!req.params.token){
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  const response = await user_profile_service.upgradeUserResponse(req.params.token);
  return res.send(response);
});

module.exports = router;
