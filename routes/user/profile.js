"use strict";

const router = require("express").Router();
const bcrypt = require("bcrypt");
const token_service = require("../../services/authentication/token");
const user_profile_service = require("../../services/profile/user_profile");
const user_role_manager = require("../../services/profile/user_roles_manager");

// GET user by ID
router.get("/user", token_service.authenticateToken, async (req, res) => {
  const response = await user_profile_service.getUserById(req.user.id);
  if (!response.success) {
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
    profile_image_link: response.user.profile_image_link,
    banner_image_link: response.user.banner_image_link,
    bio: response.user.bio_text,
    profile_tag_line: response.user.profile_tag_line,
    address_line_1: response.user.user_address_line_1,
    address_line_2: response.user.user_address_line_2,
    city: response.user.user_city,
    postal_code: response.user.user_postal_code,
    state: response.user.user_state,
    address_type: response.user.address_type,
    business_name: response.user.business_name,
    business_type: response.user.business_type,
    profile_status: response.user.profile_status,
    subscription_code: response.user.subscription_code,
    verified: response.user.is_email_verified
  };
  res.status(200).json({
    success: true,
    user: user
  });
});

router.post(
  "/user/upgrade",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      !req.body.upgrade_type ||
      !req.body.document_type ||
      !req.body.document_link ||
      !req.body.issue_date ||
      !req.body.expiry_date
    ) {
      return res.status(403).json({
        success: false,
        message: "Required Parameters are not available in request"
      });
    }
    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );
      if (!user_details_from_db.success) {
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
        expiry_date: req.body.expiry_date,
        is_participating_in_festival: req.body.is_participating_in_festival
      };
      const response = await user_profile_service.upgradeUser(
        db_user,
        upgrade_details
      );
      return res.send(response);
    } catch (err) {
      res.send({
        success: false,
        message: "error",
        response: err
      });
    }
  }
);

router.post("/user/upgrade/action/:token", async (req, res) => {
  if (!req.params.token) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  const response = await user_profile_service.upgradeUserResponse(
    req.params.token
  );
  return res.send(response);
});

router.put("/user/update-account/:id", async (req, res) => {
  try {
    const pw = req.body.password;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(pw, salt);
    const user = {
      id: req.params.id,
      profile_image_link: req.body.profile_image_link,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      password,
      phone_number: req.body.phone_number,
      profile_tag_line: req.body.profile_tag_line,
      bio_text: req.body.bio_text,
      banner_image_link: req.body.banner_image_link
    };

    const response = await user_profile_service.updateUserAccount(user);

    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists."
      });
    }
  } catch (err) {
    console.log("Update", err);
  }
});

router.put("/user/update-profile/:id", async (req, res) => {
  try {
    const user = {
      id: req.params.id,
      address_line_1: req.body.address_line_1,
      address_line_2: req.body.address_line_2,
      city: req.body.city,
      postal_code: req.body.postal_code,
      state: req.body.state,
      address_type: req.body.address_type,
      business_name: req.body.business_name,
      business_type: req.body.business_type,
      profile_status: req.body.profile_status
    };

    const response = await user_profile_service.updateUserProfile(user);

    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists."
      });
    }
  } catch (err) {
    console.log("Update", err);
  }
});

module.exports = router;
