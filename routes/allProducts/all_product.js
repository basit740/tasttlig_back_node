"use strict";
// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const all_product_service = require("../../services/allProducts/all_product");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const auth_server_service = require("../../services/authentication/auth_server_service");
const festival_service = require("../../services/festival/festival");
const {
  generateRandomString,
  formatTime,
} = require("../../functions/functions");

// Environment variables
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// GET all food samples in festival
router.get("/all-products/festival/:festivalId", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const status_operator = "=";
    const food_sample_status = "ACTIVE";

    const filters = {
      price: req.query.price,
      quantity: req.query.quantity,
      size: req.query.size,
    };

    const response = await all_product_service.getAllProductsInFestival(
      status_operator,
      food_sample_status,
      keyword,
      filters,
      req.params.festivalId
    );
    // console.log("response from all product:", response);

    return res.send(response);
  } catch (error) {
    //(error);
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// POST food sample
router.post(
  "/all-products/add",
  token_service.authenticateToken,
  async (req, res) => {
    console.log(
      ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>im coming from all products add:",
      req.body
    );
    try {
      req.body.map(async (item) => {
        if (
          !item.name ||
          !item.festivals ||
          !item.sample_size ||
          !item.quantity ||
          !item.description ||
          !item.images ||
          !item.end_time ||
          !item.start_time ||
          !item.nationality_id
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

          let createdByAdmin = false;
          let db_user = user_details_from_db.user;
          let user_role_object = db_user.role;

          if (user_role_object.includes("ADMIN")) {
            if (!item.userEmail) {
              return res.status(403).json({
                success: false,
                message: "Required parameters are not available in request.",
              });
            }

            const host_details_from_db = await user_profile_service.getUserByEmail(
              item.userEmail
            );
            db_user = host_details_from_db.user;
            createdByAdmin = true;
          }

          const all_product_details = {
            product_user_id: db_user.tasttlig_user_id,
            title: item.name,
            start_time:
              item.start_time.length === 5
                ? item.start_time
                : formatTime(item.start_time),
            end_time:
              item.end_time.length === 5
                ? item.end_time
                : formatTime(item.end_time),
            description: item.description,

            nationality_id: item.nationality_id,
            product_size: item.sample_size,
            product_type: item.product_type,
            is_available_on_monday:
              item.is_available_on_monday !== undefined
                ? item.is_available_on_monday
                : item.daysAvailable.includes("available_on_monday"),
            is_available_on_tuesday:
              item.is_available_on_tuesday !== undefined
                ? item.is_available_on_tuesday
                : item.daysAvailable.includes("available_on_tuesday"),
            is_available_on_wednesday:
              item.is_available_on_wednesday !== undefined
                ? item.is_available_on_wednesday
                : item.daysAvailable.includes("available_on_wednesday"),
            is_available_on_thursday:
              item.is_available_on_thursday !== undefined
                ? item.is_available_on_thursday
                : item.daysAvailable.includes("available_on_thursday"),
            is_available_on_friday:
              item.is_available_on_friday !== undefined
                ? item.is_available_on_friday
                : item.daysAvailable.includes("available_on_friday"),
            is_available_on_saturday:
              item.is_available_on_saturday !== undefined
                ? item.is_available_on_saturday
                : item.daysAvailable.includes("available_on_saturday"),
            is_available_on_sunday:
              item.is_available_on_sunday !== undefined
                ? item.is_available_on_sunday
                : item.daysAvailable.includes("available_on_sunday"),
            is_vegetarian:
              item.is_vegetarian !== undefined
                ? item.is_vegetarian
                : item.dietaryRestrictions.includes("vegetarian"),
            is_vegan:
              item.is_vegan !== undefined
                ? item.is_vegan
                : item.dietaryRestrictions.includes("vegan"),
            is_gluten_free:
              item.is_gluten_free !== undefined
                ? item.is_gluten_free
                : item.dietaryRestrictions.includes("glutenFree"),
            is_halal:
              item.is_halal !== undefined
                ? item.is_halal
                : item.dietaryRestrictions.includes("halal"),
            spice_level: item.spice_level,
            price: item.price,
            quantity: parseInt(item.quantity),
            food_ad_code: generateRandomString(4),
            status: "ACTIVE",
            festival_selected: item.festivals,
            claimed_total_quantity: 0,
            redeemed_total_quantity: 0,
          };
          // adding product to central server

          const response = await all_product_service.createNewProduct(
            db_user,
            all_product_details,
            item.images,
            createdByAdmin
          );
          res.send(response);
          if (response.success) {
            const product_central_server = await auth_server_service.createNewProductInCentralServer(
              db_user,
              all_product_details,
              item.images
            );
          }
          //console.log("response from food sample", response);
          return {
            success: true,
          };
        } catch (error) {
          console.log(error);
          res.send({
            success: false,
            message: "Error.",
            response: error,
          });
        }
      });
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

// GET all food samples from user
router.get(
  "/all-products/user/all",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const current_page = req.query.page || 1;
      const keyword = req.query.keyword || "";
      const festival_id = req.query.festival || "";
      //console.log("request params", req.query);
      //console.log("festival_id", festival_id);
      const status_operator = "!=";
      const food_sample_status = "ARCHIVED";

      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }

      let requestByAdmin = false;
      let db_user = user_details_from_db.user;
      let user_role_object = db_user.role;

      if (user_role_object.includes("ADMIN")) {
        requestByAdmin = true;
      }

      const response = await all_product_service.getAllUserProducts(
        req.user.id,
        status_operator,
        food_sample_status,
        keyword,
        current_page,
        requestByAdmin,
        festival_id
      );
      console.log("Products details", response);
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

router.post("/add-product-from-kodidi", async (req, res) => {
  console.log(req.body);
  if (!req.body.all_product_details || !req.body.db_user || !req.body.images) {
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
      business_details_from_db = await authentication_service.getUserByBusinessDetails(
        user_details_from_db.user.id
      );
    }
    //console.log(user_details_from_db);
    const product_information = req.body.all_product_details;
    const product_insertion = {
      product_user_id: user_details_from_db.user
        ? user_details_from_db.user.tasttlig_user_id
        : null,
      title: product_information.title,
      start_time: formatTime(product_information.start_time),
      end_time: formatTime(product_information.end_time),
      description: product_information.description,
      quantity: product_information.quantity,
      price: product_information.price,
      product_size: product_information.size,
    };
    const response = await all_product_service.createNewProductFromKodidi(
      user_details_from_db,
      product_insertion,
      req.body.images
    );
    console.log(response);
    return res.send(response);
  } catch (error) {
    console.log("error: ", error);
    res.send({
      success: false,
      message: "Error.",
      response: error,
    });
  }
});

module.exports = router;
