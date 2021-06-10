"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const products_service = require("../../services/products/products");
const vendor_service = require("../../services/vendor/vendor");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const { generateRandomString } = require("../../functions/functions");

router.post(
  "/vendor/:userId",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      !req.body.cooking_area ||
      !req.body.food_temperature_maintenance_plan ||
      !req.body.equipment_required
    ) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      })
    }

    try {
      let user_details_from_db;
      user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );


      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }

      let business_details_from_db;
      business_details_from_db = await authentication_service.getUserByBusinessDetails(
        req.user.id)

      if (
        user_details_from_db.user.role.includes("VENDOR") ||
        user_details_from_db.user.role.includes("VENDOR_PENDING")
      ) {
        if (!business_details_from_db.success) {
          return res.status(403).json({
            success: false,
            message: business_details_from_db.message,
          });
        }
      }

      let db_business_details = business_details_from_db.business_details;
      console.log("business_details", db_business_details);
      console.log("user id" , user_details_from_db);
      const vendor_information = {
        vendor_user_id: req.user.id,
       // vendor_business_id: db_business_details.business_details_id,
        cooking_area: req.body.cooking_area, 
        food_temperature_maintenance_plan: req.body.food_temperature_maintenance_plan,
        equipment_required: req.body.equipment_required,
        other_info: req.body.other_info ? req.body.other_info : null
      };
      const response = await vendor_service.insertVendorDetails(
        user_details_from_db,
        vendor_information,
      );
      let result;
      console.log(response);
      if (response.success) {
        result = response
      } else {
        return res.send({
          success: false,
          message: "Error."
        })


      }
      console.log("new response", result);
      return res.send(result);

    } catch (error) {
      console.log(error);
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });

    }
  }
);

module.exports = router;