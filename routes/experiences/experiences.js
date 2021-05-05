"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const experiences_service = require("../../services/experiences/experiences");
const experience_service = require("../../services/experience/experience");
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
      //!req.body.experience_nationality_id ||
      !req.body.experience_description ||
      !req.body.experience_capacity ||
      !req.body.experience_size_scope ||
      !req.body.experience_description ||
      !req.body.experience_images ||
      //!req.body.festival_selected ||
      !req.body.start_date ||
      !req.body.end_date ||
      !req.body.start_time ||
      !req.body.end_time
    ) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }
    console.log("req body from experinces/add", req.body)

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

      const business_details_from_db = await authentication_service.getUserByBusinessDetails(
        req.user.id
      );
      console.log("business_details_from_db", business_details_from_db)
      if (!business_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: business_details_from_db.message,
        });
      }

      if (user_details_from_db.user.role.includes("ADMIN")) {
        createdByAdmin = true;
      }

      let db_business_details = business_details_from_db.business_details;

      const experience_information = {
        experience_business_id: createdByAdmin
          ? null
          : db_business_details.business_details_id,
        experience_name: req.body.experience_name,
        experience_nationality_id: req.body.experience_nationality_id
          ? req.body.experience_nationality_id
          : null,
        experience_price: req.body.experience_price
          ? req.body.experience_price
          : 0,
        experience_capacity: req.body.experience_capacity,
        experience_size_scope: req.body.experience_size_scope,
        experience_description: req.body.experience_description,
        experience_type: req.body.experience_type
          ? req.body.experience_type
          : null,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        additional_pricing_info: req.body.additional_pricing_info,
        additional_information: req.body.additional_information
          ? req.body.additional_information
          : null,

        festival_selected:
          req.body.festival_selected &&
          Array.isArray(req.body.festival_selected)
            ? req.body.festival_selected
            : req.body.festival_selected
            ? [req.body.festival_selected]
            : null,

        products_selected:
          req.body.products_selected &&
          Array.isArray(req.body.products_selected)
            ? req.body.products_selected
            : req.body.products_selected
            ? [req.body.products_selected]
            : null,

        services_selected:
          req.body.services_selected &&
          Array.isArray(req.body.services_selected)
            ? req.body.services_selected
            : req.body.services_selected
            ? [req.body.services_selected]
            : null,
        experience_code: generateRandomString(4),
        experience_status: "ACTIVE",
        experience_created_at_datetime: new Date(),
        experience_updated_at_datetime: new Date(),
      };

      console.log("experience_information",experience_information);
      const response = await experience_service.createNewExperience(
        user_details_from_db,
        experience_information,
        req.body.experience_images
      );

      return res.send(response);
    } catch (error) {
      console.log("error: ", error)
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

// GET experiences in specific festival
router.get("/experiences/festival/:festival_id", async (req, res) => {

  // console.log("req.params.festival_id", req.params.festival_id);
  if (!req.params.festival_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await experiences_service.getExperiencesInFestival(
      req.params.festival_id
    );
      // console.log("response coming from experiences", response);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET experiences in specific festival
router.get("/experiences/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  

  let user_details_from_db;
  if (req.params.user_id) {
    user_details_from_db = await user_profile_service.getUserById(
      req.params.user_id
    );
  }

  if (!user_details_from_db.success) {
    return res.status(403).json({
      success: false,
      message: user_details_from_db.message,
    });
  }

  let business_details_from_db;
  if (req.params.user_id) {
    business_details_from_db = await authentication_service.getUserByBusinessDetails(
      req.params.user_id
    );
  } else {
    business_details_from_db = await authentication_service.getUserByBusinessDetails(
      req.params.user_id
    );
  }

  if (!business_details_from_db.success) {
    return res.status(403).json({
      success: false,
      message: business_details_from_db.message,
    });
  }

  let business_details_id =
    business_details_from_db.business_details.business_details_id;
    console.log("business_details_id from expereiences get:", business_details_id)
  try {
    const response = await experience_service.getUserExperiencesById(
      business_details_id
    );
    console.log("response from expereiences get:", response)
    return res.send(response);
  } catch (error) {
    console.log("error from expereiences get:", error)
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// POST claim experience in specific festival
router.post("/claim-experience", async (req, res) => {
  const { experience_claim_user, experience_id } = req.body;

  if (!experience_claim_user || !experience_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    let db_user;
    let db_experience;

    db_user = await user_profile_service.getUserByPassportIdOrEmail(
      experience_claim_user
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: db_user.message,
      });
    }

    db_user = db_user.user;

    db_experience = await experiences_service.findExperience(experience_id);

    if (!db_experience.success) {
      return res.status(403).json({
        success: false,
        message: db_experience.message,
      });
    }

    const response = await experiences_service.claimExperience(
      db_user,
      experience_id
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
