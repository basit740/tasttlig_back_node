"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const experiences_service = require("../../services/experiences/experiences");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const { generateRandomString } = require("../../functions/functions");

// POST experiences
router.post(
  "/experiences/add",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      !req.body.experience_name ||
      !req.body.experience_nationality_id ||
      !req.body.experience_price ||
      !req.body.experience_capacity ||
      !req.body.experience_size_scope ||
      !req.body.experience_description ||
      !req.body.experience_images ||
      !req.body.experience_festival_id
    ) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }

      let createdByAdmin = true;

      const business_details_from_db = await authentication_service.getUserByBusinessDetails(
        req.user.id
      );

      if (
        user_details_from_db.user.role.includes("RESTAURANT") ||
        user_details_from_db.user.role.includes("RESTAURANT_PENDING")
      ) {
        if (!business_details_from_db.success) {
          return res.status(403).json({
            success: false,
            message: business_details_from_db.message,
          });
        }

        createdByAdmin = false;
      }

      let db_business_details = business_details_from_db.business_details;

      const experience_information = {
        experience_business_id: createdByAdmin
          ? null
          : db_business_details.business_details_id,
        experience_name: req.body.experience_name,
        experience_nationality_id: req.body.experience_nationality_id,
        experience_price: req.body.experience_price,
        experience_capacity: req.body.experience_capacity,
        experience_size_scope: req.body.experience_size_scope,
        experience_description: req.body.experience_description,
        experience_festival_id: req.body.experience_festival_id,
        experience_code: generateRandomString(4),
        experience_status: "ACTIVE",
        experience_created_at_datetime: new Date(),
        experience_updated_at_datetime: new Date(),
      };

      const response = await experiences_service.createNewExperience(
        user_details_from_db,
        experience_information,
        req.body.experience_images
      );

      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

// GET all experiences
router.get("/experiences/all", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";
    const status_operator = "=";
    const experience_status = "ACTIVE";
    const filters = {
      nationalities: req.query.nationalities,
      radius: req.query.radius,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    const response = await experience_service.getAllexperiences(
      status_operator,
      experience_status,
      keyword,
      current_page,
      filters
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

module.exports = router;
