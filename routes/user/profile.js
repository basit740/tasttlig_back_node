"use strict";

const router = require("express").Router();
const bcrypt = require("bcrypt");
const token_service = require("../../services/authentication/token");
const user_profile_service = require("../../services/profile/user_profile");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const point_system_service = require("../../services/profile/points_system");
const user_role_manager = require("../../services/profile/user_roles_manager");
const {formatPhone} = require("../../functions/functions");

// GET user by ID
router.get("/user", token_service.authenticateToken, async (req, res) => {
  const response = await user_profile_service.getUserBySubscriptionId(req.user.id);
  if (!response.success) {
    return res.status(403).json({
      success: false,
      message: response.message
    });
  }
  const points_total = await point_system_service.getUserPoints(response.user.tasttlig_user_id);
  
  let user = {
    id: response.user.tasttlig_user_id,
    first_name: response.user.first_name,
    last_name: response.user.last_name,
    email: response.user.email,
    phone_number: response.user.phone_number,
    role: response.user.role,
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
    verified: response.user.is_email_verified,
    passport_id: response.user.passport_id,
    points: (points_total.data[0].sum ? points_total.data[0].sum : 0)
  };
  res.status(200).json({
    success: true,
    user: user
  });
});

const extractBusinessInfo = (user_details_from_db, requestBody) => {
  return {
    user_id: user_details_from_db.user.tasttlig_user_id,
    business_name: requestBody.business_name,
    business_type: requestBody.business_type,
    ethnicity_of_restaurant: requestBody.culture,
    business_address_1: requestBody.address_line_1,
    business_address_2: requestBody.address_line_2,
    city: requestBody.business_city,
    state: requestBody.state,
    postal_code: requestBody.postal_code,
    country: requestBody.country,
    phone_number: requestBody.phone_number,
    business_registration_number: requestBody.registration_number,
    instagram: requestBody.instagram,
    facebook: requestBody.facebook
  };
};

const extractFile = (requestBody, key, text) => {
  return {
    document_type: text,
    issue_date: new Date(requestBody[key + '_date_of_issue']),
    expiry_date: new Date(requestBody[key + '_date_of_expired']),
    document_link: requestBody.food_handler_certificate,
    status: "Pending"
  };
};

router.post(
  "/user/host",
  async (req, res) => {

    try {
      const hostDto = req.body;
      const response = await user_profile_service.saveHostApplication(hostDto, req.user);

      if (response.success) {
        return res.send(response);
      }

      return res.status(500).send(response);
    } catch (e) {
      return res.status(403).json({
        success: false,
        message: e
      });
    }
  });

router.get("/user/application/:token", async (req, res) => {
  if (!req.params.token) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request",
    });
  }
  const response = await user_profile_service.handleAction(req.params.token);
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
      banner_image_link: req.body.banner_image_link,
    };

    const response = await user_profile_service.updateUserAccount(user);

    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists.",
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
      profile_status: req.body.profile_status,
    };

    const response = await user_profile_service.updateUserProfile(user);

    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists.",
      });
    }
  } catch (err) {
    console.log("Update", err);
  }
});

router.get("/user/checkEmail/:email", async (req, res) => {
  try {
    const result = await user_profile_service.getUserByEmail(req.params.email);

    if (result.success) {
      const {success, user: {tasttlig_user_id, email}} = result
      return res.send({success, user: {tasttlig_user_id, email}});
    } else {
      return res.send({success: false});
    }
  } catch (e) {
    res.status(500).send({success: false, message: e});
  }
});

module.exports = router;
