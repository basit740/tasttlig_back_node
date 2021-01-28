"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const services_service = require("../../services/services/services");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const { generateRandomString } = require("../../functions/functions");

// POST services
router.post(
  "/services/add",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      !req.body.service_name ||
      !req.body.service_nationality_id ||
      !req.body.service_price ||
      !req.body.service_capacity ||
      !req.body.service_size_scope ||
      !req.body.service_description ||
      !req.body.service_images ||
      !req.body.service_festival_id
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

      const service_information = {
        service_business_id: createdByAdmin
          ? null
          : db_business_details.business_details_id,
        service_name: req.body.service_name,
        service_nationality_id: req.body.service_nationality_id,
        service_price: req.body.service_price,
        service_capacity: req.body.service_capacity,
        service_size_scope: req.body.service_size_scope,
        service_description: req.body.service_description,
        service_festival_id: req.body.service_festival_id,
        service_code: generateRandomString(4),
        service_status: "ACTIVE",
        service_created_at_datetime: new Date(),
        service_updated_at_datetime: new Date(),
      };

      const response = await services_service.createNewService(
        user_details_from_db,
        service_information,
        req.body.service_images
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

// GET services in specific festival
router.get("/services/festival/:festival_id", async (req, res) => {
  if (!req.params.festival_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await services_service.getServicesInFestival(
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

// POST claim service in specific festival
router.post("/claim-service", async (req, res) => {
  const { service_claim_user, service_id } = req.body;

  if (!service_claim_user || !service_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    let db_user;
    let db_service;

    db_user = await user_profile_service.getUserByPassportIdOrEmail(
      service_claim_user
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: db_user.message,
      });
    }

    db_user = db_user.user;

    db_service = await services_service.findService(service_id);

    if (!db_service.success) {
      return res.status(403).json({
        success: false,
        message: db_service.message,
      });
    }

    const response = await services_service.claimService(db_user, service_id);

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
