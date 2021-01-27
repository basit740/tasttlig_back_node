"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const experiences_service = require("../../services/experiences/experiences");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");

// POST experiences
router.post(
  "/experiences/add",
  token_service.authenticateToken,
  async (req, res) => {
    console.log(req.body);
    if (
      !req.body.experience_name ||
      !req.body.experience_nationality_id ||
      !req.body.experience_price ||
      !req.body.experience_capacity ||
      !req.body.experience_size_scope ||
/*       !req.body.experience_expiry_date ||
      !req.body.experience_expiry_time || */
      !req.body.experience_description ||
      !req.body.experience_images
      ) 
      {
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

      let createdByAdmin = false;
      let db_user = user_details_from_db.user;
      console.log(db_user)

      const experience_information = {
        experience_business_id: db_user.business_id,
        experience_name: req.body.experience_name,
        experience_nationality_id: req.body.experience_nationality_id,
        experience_price: req.body.experience_price,
        experience_capacity: req.body.experience_capacity,
        experience_size_scope: req.body.experience_size_scope,
/*         experience_expiry_date: req.body.experience_expiry_date,
        experience_expiry_time: req.body.experience_expiry_time, */
        experience_description: req.body.experience_description,
      };
      //console.log(experience_information)
      const response = await experiences_service.createNewExperience(
        db_user,
        experience_information,
        req.body.experience_images,
        createdByAdmin
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
