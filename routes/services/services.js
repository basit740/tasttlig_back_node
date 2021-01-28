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
    console.log(req.body);
    if (
      !req.body.service_name ||
      !req.body.service_nationality_id ||
      !req.body.service_price ||
      !req.body.service_capacity ||
      !req.body.service_size_scope ||
      !req.body.service_description ||
      !req.body.service_images ||
      !req.body.service_festival_id
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

      const service_information = {
        service_business_id: db_user.business_id,
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
      console.log(service_information)
      const response = await services_service.createNewService(
        db_user,
        service_information,
        req.body.service_images,
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

module.exports = router;