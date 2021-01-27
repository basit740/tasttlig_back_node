"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const products_service = require("../../services/services/services");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");

// POST products
router.post(
  "/services/add",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      !req.body.serviceName ||
      !req.body.nationality_id ||
      !req.body.servicePrice ||
      !req.body.serviceCapacity ||
      !req.body.serviceScope ||
      !req.body.serviceDescription ||
      !req.body.serviceDays ||
      !req.body.serviceHours ||
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

      const service_information = {
        service_business_id: db_user.business_details_user_id,
        service_name: req.body.serviceName,
        service_nationality_id: req.body.nationality_id,
        service_price: req.body.servicePrice,
        service_capacity: req.body.serviceCapacity,
        service_size_scope: req.body.serviceScope,
        service_description: req.body.productDescription,
        service_days: req.body.serviceDays,
        service_hours: req.body.serviceHours,
               
        
      };

      const response = await experience_service.createNewService(
        db_user,
        service_information,
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

// GET all products
router.get("/services/all", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";
    const status_operator = "=";
    const service_status = "ACTIVE";
    const filters = {
      nationalities: req.query.nationalities,
      radius: req.query.radius,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    const response = await service_service.getAllService(
      status_operator,
      service_status,
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
