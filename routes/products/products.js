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
    console.log(req.body);
    if (
      (!req.body[0].product_name ||
      !req.body[0].product_made_in_nationality_id ||
      !req.body[0].product_price ||
      !req.body[0].product_quantity ||
      !req.body[0].product_size ||
      !req.body[0].product_expiry_date ||
      !req.body[0].product_expiry_time ||
      !req.body[0].product_description ||
      !req.body[0].product_images)
      //||
     // !req.body.product_festival_id
    ) {
      if ((
        !req.body.product_name ||
          !req.body.product_made_in_nationality_id ||
          !req.body.product_price ||
          !req.body.product_quantity ||
          !req.body.product_size ||
          !req.body.product_expiry_date ||
          !req.body.product_expiry_time ||
          !req.body.product_description ||
          !req.body.product_images)
      ) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      })
    };
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
        user_details_from_db.user.role.includes("VENDOR") ||
        user_details_from_db.user.role.includes("VENDOR_PENDING")
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
      let result= ""
      for (let product of req.body) {
        let productInFestival
        if (product.festivalId) {
          productInFestival = product.festivalId;
        } else {
          productInFestival = null;
        }
        const product_information = {
          product_business_id: createdByAdmin
            ? null
            : db_business_details.business_details_id,
          product_name: product.product_name,
          product_made_in_nationality_id: product.product_made_in_nationality_id,
          product_price: product.product_price,
          product_quantity: product.product_quantity,
          product_size: product.product_size,
          product_expiry_date: product.product_expiry_date,
          product_expiry_time: product.product_expiry_time,
          product_description: product.product_description,
          product_festivals_id: [productInFestival],
          product_code: generateRandomString(4),
          product_status: "ACTIVE",
          product_created_at_datetime: new Date(),
          product_updated_at_datetime: new Date(),
        };
         const response = await products_service.createNewProduct(
          user_details_from_db,
          product_information,
          (product.product_images || product.images)
        );
        console.log(response);
          if (response.success) {
            result = response
          } else {
            return res.send({
              success: false,
              message: "Error."
          })
        }
      }
      console.log("new response", result);
      return res.send(result);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);
// POST products
router.post(
  "/products/festival/:festivalId",
  token_service.authenticateToken,
  async (req, res) => {
    console.log(req.body);
    if (!req.body.festivalId) { 
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      })
    ;
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
        user_details_from_db.user.role.includes("VENDOR") ||
        user_details_from_db.user.role.includes("VENDOR_PENDING")
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
      let result= ""
         const response = await products_service.addProductToFestival(
          req.body.festivalId,
          req.body.productId
        );
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

// GET products in specific festival
router.get("/products/festival/:festival_id", async (req, res) => {
  if (!req.params.festival_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await products_service.getProductsInFestival(
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
// GET products in specific festival
router.get("/products/user/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await products_service.getProductsFromUser(
      req.params.user_id
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

// POST claim product in specific festival
router.post("/claim-product", async (req, res) => {
  const { product_claim_user, product_id } = req.body;

  if (!product_claim_user || !product_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    let db_user;
    let db_product;

    db_user = await user_profile_service.getUserByPassportIdOrEmail(
      product_claim_user
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: db_user.message,
      });
    }

    db_user = db_user.user;

    db_product = await products_service.findProduct(product_id);

    if (!db_product.success) {
      return res.status(403).json({
        success: false,
        message: db_product.message,
      });
    }

    const response = await products_service.claimProduct(db_user, product_id);

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
