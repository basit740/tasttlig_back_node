"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const experiences_service = require("../../services/experiences/experiences");
const experience_service = require("../../services/experience/experience");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const auth_server_service = require("../../services/authentication/auth_server_service");
const business_service = require("../../services/passport/businessPassport");
const festival_service = require("../../services/festival/festival");
const {generateRandomString} = require("../../functions/functions");

// POST experiences
router.post(
  "/experiences/add",
  token_service.authenticateToken,
  async (req, res) => {
    console.log(req.body);
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

      // let createdByAdmin = false;

      // const business_details_from_db =
      //   await authentication_service.getUserByBusinessDetails(req.user.id);
      // if (!business_details_from_db.success) {
      //   return res.status(403).json({
      //     success: false,
      //     message: business_details_from_db.message,
      //   });
      // }

      // if (user_details_from_db.user.role.includes("ADMIN")) {
      //   createdByAdmin = true;
      // }

      // let db_business_details = business_details_from_db.business_details;
      const experience_information = {
        experience_business_id: req.body.business_id,

        experience_name: req.body.experience_name,
        experience_nationality_id: req.body.experience_nationality_id
          ? req.body.experience_nationality_id
          : null,
        experience_price: req.body.experience_price
          ? req.body.experience_price
          : 2,
        experience_capacity: req.body.experience_capacity,
        experience_user_id: user_details_from_db.user.tasttlig_user_id,
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
        promotion: req.body.experience_offering_type,
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
        experience_updated_at_datetime: new Date()
      };


      const response = await experience_service.createNewExperience(
        user_details_from_db,
        experience_information,
        req.body.experience_images,
        req.body.sponsorType
      );
      res.send(response);
      if (response.success) {
        // update the promote status to INACTIVE

        await business_service.updateBusinessPromoUsed(
          req.body.business_id, db_festival.details[0].festival_id, req.body.experience_offering_type[0]
        );


      }

      return {
        success: true,
      };
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);
router.post("/add-experience-from-kodidi", async (req, res) => {
  if (process.env.API_ACCESS_TOKEN !== req.body.access_token) {
    return res.status(403).json({
      success: false,
      message: "Access Denied",
    });
  }
  if (
    !req.body.all_experience_details ||
    !req.body.db_user ||
    !req.body.images
  ) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const user_details_from_db = await user_profile_service.getUserByEmail(
      req.body.db_user.email
    );
    //console.log("user details", user_details_from_db);
    let business_details_from_db;
    if (user_details_from_db.success) {
      business_details_from_db =
        await authentication_service.getUserByBusinessDetails(
          user_details_from_db.user.id
        );
    }
    const experience_information = req.body.all_experience_details;
    const experience_insertion = {
      experience_name: experience_information.title,
      experience_price: experience_information.regular_price,
      experience_description: experience_information.special_description,
    };
    const response = await experience_service.createNewExperience(
      user_details_from_db,
      experience_insertion,
      req.body.images
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error,
    });
  }
});
// GET experiences in specific festival
router.get("/experiences/festival/:festival_id", async (req, res) => {
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
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET all experiences globally
router.get("/experiences/all", async (req, res) => {

  try {
    const response = await experiences_service.getAllExperiences();
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET all experiences from a business
router.get("/experiences/business/:business_id", async (req, res) => {
  if (!req.params.business_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await experience_service.getUserExperiencesById(
      req.params.business_id,
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

// POST claim experience in specific festival
router.post("/claim-experience", async (req, res) => {
  const {experience_claim_user, experience_id} = req.body;

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
