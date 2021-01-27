"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const products_service = require("../../services/experiences/experiences");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");

// POST products
router.post(
  "/experiences/add",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      !req.body.experienceName ||
      !req.body.nationality_id ||
      !req.body.experiencePrice ||
      !req.body.experienceCapacity ||
      !req.body.experienceScope ||
      !req.body.experienceDescription ||
      !req.body.experienceeDays ||
      !req.body.experienceHours ||
      !req.body.images
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

      // let user_role_object = db_user.role;
      // if (user_role_object.includes("ADMIN")){
      //   if (!req.body.userEmail) {
      //     return res.status(403).json({
      //       success: false,
      //       message: "Required parameters are not available in request."
      //     });
      //   }
      //   const host_details_from_db = await user_profile_service.getUserByEmail(req.body.userEmail);
      //   db_user = host_details_from_db.user;
      //   createdByAdmin = true;
      // }

      const exp_information = {
        experience_business_id: db_user.business_details_user_id,
        experience_name: req.body.experienceName,
        experience_nationality_id: req.body.nationality_id,
        experience_price: req.body.experiencePrice,
        experience_capacity: req.body.experienceCapacity,
        experience_size_scope: req.body.experienceScope,
        experience_description: req.body.experienceDescription,
        experience_days: req.body.experienceDays,
        experience_hours: req.body.experienceHours,
               
        
      };

      const response = await experiences_service.createNewExp(
        db_user,
        exp_information,
        req.body.images,
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

    const response = await experience_service.getAllExperience(
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
