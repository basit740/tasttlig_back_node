"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const products_service = require("../../services/products/products");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const { generateRandomString } = require("../../functions/functions");

// POST products
router.post(
  "/products/add",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      !req.body.product_name ||
      !req.body.product_made_in_nationality_id ||
      !req.body.product_price ||
      !req.body.product_quantity ||
      !req.body.product_size ||
      !req.body.product_expiry_date ||
      !req.body.product_expiry_time ||
      !req.body.product_description ||
      !req.body.product_images ||
      !req.body.product_festival_id
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

      const product_information = {
        product_business_id: createdByAdmin
          ? null
          : db_business_details.business_details_id,
        product_name: req.body.product_name,
        product_made_in_nationality_id: req.body.product_made_in_nationality_id,
        product_price: req.body.product_price,
        product_quantity: req.body.product_quantity,
        product_size: req.body.product_size,
        product_expiry_date: req.body.product_expiry_date,
        product_expiry_time: req.body.product_expiry_time,
        product_description: req.body.product_description,
        product_festival_id: req.body.product_festival_id,
        product_code: generateRandomString(4),
        product_status: "ACTIVE",
        product_created_at_datetime: new Date(),
        product_updated_at_datetime: new Date(),
      };

      const response = await products_service.createNewProduct(
        user_details_from_db,
        product_information,
        req.body.product_images
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
router.get("/products/all", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";
    const status_operator = "=";
    const product_status = "ACTIVE";
    const filters = {
      nationalities: req.query.nationalities,
      radius: req.query.radius,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    const response = await product_service.getAllProducts(
      status_operator,
      product_status,
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
