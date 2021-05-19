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
    let body;
    if (req.body[0]) {
      body = req.body[0];
    } else {
      body = req.body;
    }
    if (
      !body.product_name ||
      !body.product_made_in_nationality_id ||
      !body.product_price ||
      !body.product_quantity ||
      !body.product_size ||
      !body.product_expiry_date ||
      //!body.product_expiry_time ||
      !body.product_description ||
      !body.product_images ||
      // !req.body.product_festival_id
      !req.body.product_creator_type
    ) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    try {
      let user_details_from_db;
      if (req.user) {
        user_details_from_db = await user_profile_service.getUserById(
          req.user.id
        );
      } else {
        user_details_from_db = await user_profile_service.getUserByEmail(
          req.query.email
        );
      }

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }

      let createdByAdmin = true;
      let business_details_from_db;
      if (req.user) {
        business_details_from_db =
          await authentication_service.getUserByBusinessDetails(req.user.id);
      } else {
        business_details_from_db =
          await authentication_service.getUserByBusinessDetails(
            user_details_from_db.user.tasttlig_user_id
          );
      }

      if (
        user_details_from_db.user.role.includes("VENDOR") ||
        user_details_from_db.user.role.includes("VENDOR_PENDING") ||
        user_details_from_db.user.role.includes("SPONSOR_PENDING") ||
        user_details_from_db.user.role.includes("SPONSOR")
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
      let result = "";
      if (req.body[0]) {
        for (let product of body) {
          let productInFestival;
          if (product.product_festival_id) {
            productInFestival = product.product_festival_id;
          } else {
            productInFestival = null;
          }
          const product_information = {
            product_business_id: createdByAdmin
              ? null
              : db_business_details.business_details_id,
            product_name: product.product_name,
            product_made_in_nationality_id:
              product.product_made_in_nationality_id,
            product_price: product.product_price,
            product_quantity: product.product_quantity,
            product_size: product.product_size,
            product_expiry_date: product.product_expiry_date,
            product_expiry_time: product.product_expiry_time,
            product_description: product.product_description,
            product_festivals_id: Array.isArray(productInFestival)
              ? productInFestival
              : productInFestival
              ? [productInFestival]
              : null,
            product_code: generateRandomString(4),
            product_status: "ACTIVE",
            product_created_at_datetime: new Date(),
            product_updated_at_datetime: new Date(),
            product_creator_type: req.body.product_creator_type,
            product_user_id: req.user.id,
          };
          const response = await products_service.createNewProduct(
            user_details_from_db,
            product_information,
            product.product_images || product.images
          );
          if (response.success) {
            result = response;
          } else {
            return res.send({
              success: false,
              message: "Error.",
            });
          }
        }
      } else {
        let productInFestival;
        if (body.product_festival_id) {
          productInFestival = body.product_festival_id;
        } else {
          productInFestival = null;
        }
        const product_information = {
          product_business_id: createdByAdmin
            ? null
            : db_business_details.business_details_id,
          product_name: body.product_name,
          product_made_in_nationality_id: body.product_made_in_nationality_id,
          product_price: body.product_price,
          product_quantity: body.product_quantity,
          product_size: body.product_size,
          product_expiry_date: body.product_expiry_date,
          //product_expiry_time: body.product_expiry_time,
          product_manufacture_date: body.product_manufacture_date,
          product_description: body.product_description,
          product_festivals_id: Array.isArray(productInFestival)
            ? productInFestival
            : productInFestival
            ? [productInFestival]
            : null,
          product_code: generateRandomString(4),
          product_status: "ACTIVE",
          product_created_at_datetime: new Date(),
          product_updated_at_datetime: new Date(),
          product_creator_type: req.body.product_creator_type,
          product_user_id: req.user.id,
        };
        const response = await products_service.createNewProduct(
          user_details_from_db,
          product_information,
          body.product_images || body.images
        );
        if (response.success) {
          result = response;
        } else {
          return res.send({
            success: false,
            message: "Error.",
          });
        }
      }
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
router.post("/products/noUser/add", async (req, res) => {
  let body;
  if (req.body[0]) {
    body = req.body[0];
  } else {
    body = req.body;
  }
  if (
    !body.product_name ||
    !body.product_made_in_nationality_id ||
    !body.product_price ||
    !body.product_quantity ||
    !body.product_size ||
    !body.product_expiry_date ||
    !body.product_expiry_time ||
    !body.product_description ||
    !body.product_images ||
    // !req.body.product_festival_id
    !req.body.product_creator_type
  ) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    let user_details_from_db;
    if (req.user) {
      user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );
    } else {
      user_details_from_db = await user_profile_service.getUserByEmail(
        req.query.email
      );
    }

    if (!user_details_from_db.success) {
      return res.status(403).json({
        success: false,
        message: user_details_from_db.message,
      });
    }

    let createdByAdmin = true;
    let business_details_from_db;
    if (req.user) {
      business_details_from_db =
        await authentication_service.getUserByBusinessDetails(req.user.id);
    } else {
      business_details_from_db =
        await authentication_service.getUserByBusinessDetails(
          user_details_from_db.user.tasttlig_user_id
        );
    }
    if (
      user_details_from_db.user.role.includes("VENDOR") ||
      user_details_from_db.user.role.includes("VENDOR_PENDING") ||
      user_details_from_db.user.role.includes("SPONSOR_PENDING") ||
      user_details_from_db.user.role.includes("SPONSOR")
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
    let result = "";
    if (req.body[0]) {
      for (let product of req.body) {
        let productInFestival;
        if (product.product_festival_id) {
          productInFestival = product.product_festival_id;
        } else {
          productInFestival = null;
        }
        const product_information = {
          product_business_id: createdByAdmin
            ? null
            : db_business_details.business_details_id,
          product_name: product.product_name,
          product_made_in_nationality_id:
            product.product_made_in_nationality_id,
          product_price: product.product_price,
          product_quantity: product.product_quantity,
          product_size: product.product_size,
          product_expiry_date: product.product_expiry_date,
          product_expiry_time: product.product_expiry_time,
          product_description: product.product_description,
          product_festivals_id: Array.isArray(productInFestival)
            ? productInFestival
            : productInFestival
            ? [productInFestival]
            : null,
          product_code: generateRandomString(4),
          product_status: "ACTIVE",
          product_created_at_datetime: new Date(),
          product_updated_at_datetime: new Date(),
          product_creator_type: req.body.product_creator_type,
          product_user_id: req.user.id,
        };
        const response = await products_service.createNewProduct(
          user_details_from_db,
          product_information,
          product.product_images || product.images
        );
        if (response.success) {
          result = response;
        } else {
          return res.send({
            success: false,
            message: "Error.",
          });
        }
      }
    } else {
      let productInFestival;
      if (body.product_festival_id) {
        productInFestival = body.product_festival_id;
      } else {
        productInFestival = null;
      }
      const product_information = {
        product_business_id: createdByAdmin
          ? null
          : db_business_details.business_details_id,
        product_name: body.product_name,
        product_made_in_nationality_id: body.product_made_in_nationality_id,
        product_price: body.product_price,
        product_quantity: body.product_quantity,
        product_size: body.product_size,
        product_expiry_date: body.product_expiry_date,
        product_expiry_time: body.product_expiry_time,
        product_description: body.product_description,
        product_festivals_id: Array.isArray(productInFestival)
          ? productInFestival
          : productInFestival
          ? [productInFestival]
          : null,
        product_code: generateRandomString(4),
        product_status: "ACTIVE",
        product_created_at_datetime: new Date(),
        product_updated_at_datetime: new Date(),
        product_creator_type: req.body.product_creator_type,
        product_user_id: req.user.id,
        product_creator_type: req.body.product_creator_type,
        product_user_id: req.user.id,
      };
      const response = await products_service.createNewProduct(
        user_details_from_db,
        product_information,
        body.product_images || body.images
      );
      if (response.success) {
        result = response;
      } else {
        return res.send({
          success: false,
          message: "Error.",
        });
      }
    }
    return res.send(result);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error,
    });
  }
});
// POST products
router.post(
  "/products/festival/:festivalId",
  token_service.authenticateToken,
  async (req, res) => {
    if (!req.body.festivalId) {
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

      const business_details_from_db =
        await authentication_service.getUserByBusinessDetails(req.user.id);

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
      let result = "";
      const response = await products_service.addProductToFestival(
        req.body.festivalId,
        req.body.ps,
        req.user.id,
        user_details_from_db
      );
      console.log(response);
      if (response.success) {
        result = response;
      } else {
        return res.send({
          success: false,
          message: "Error.",
        });
      }
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

  const filters = {
    price: req.query.price,
    quantity: req.query.quantity,
    size: req.query.size,
  };

  try {
    const response = await products_service.getProductsInFestival(
      req.params.festival_id,
      filters,
      req.query.keyword
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

router.get("/products/details/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await products_service.getUserProductDetails(
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

// GET products from user
router.get("/products/user/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const response = await products_service.getProductsFromUser(
      req.query.user_id,
      req.body.keyword
    );
    // console.log('products fetched', response);
    // console.log('userrrr', req.query.user_id);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

router.delete("/products/delete/user/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const response = await products_service.deleteProductsFromUser(
      req.params.user_id,
      req.body.delete_items
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

router.put(
  "/product/update/",
  token_service.authenticateToken,
  async (req, res) => {
    if (!req.body) {
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

      let db_user = user_details_from_db.user;

      const response = await products_service.updateProduct(db_user, req.body);
      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

// DELETE product
router.delete(
  "/product/delete",
  token_service.authenticateToken,
  async (req, res) => {
    if (!req.body.product_id) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    try {
      const response = await products_service.deleteProduct(
        req.user.id,
        req.body.product_id
      );
      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

module.exports = router;
