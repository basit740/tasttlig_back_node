"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const products_service = require("../../services/products/products");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");

// POST products
router.post(
  "/products/add",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      !req.body.productName ||
      !req.body.nationality_id ||
      !req.body.productPrice ||
      !req.body.productQuantity ||
      !req.body.productSize ||
      !req.body.productExpiryDate ||
      !req.body.productExpiryTime ||
      !req.body.productDescription ||
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

      const product_information = {
        product_business_id: db_user.business_details_user_id,
        product_name: req.body.productName,
        product_made_in_nationality_id: req.body.nationality_id,
        product_price: req.body.productPrice,
        product_quantity: req.body.productQuantity,
        product_size: req.body.productSize,
        product_expiry_date: req.body.productExpiryDate,
        product_expiry_time: req.body.productExpiryTime,
        product_description: req.body.productDescription,
               
        
      };

      const response = await experience_service.createNewProduct(
        db_user,
        product_information,
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
