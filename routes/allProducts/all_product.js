"use strict";
// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const all_product_service = require("../../services/allProducts/all_product");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const festival_service = require("../../services/festival/festival")
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
      size: req.query.size
    };

    const response = await all_product_service.getAllProductsInFestival(
      status_operator,
      food_sample_status,
      keyword,
      filters,
      req.params.festivalId
    );

    return res.send(response);
  } catch (error) {
    console.log(error)
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
    console.log("im coming from here man:", req.body)
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
            price: 2.0,
            quantity: parseInt(item.quantity),
            food_ad_code: generateRandomString(4),
            status: "ACTIVE",
            festival_selected: item.festivals,
            claimed_total_quantity: 0,
            redeemed_total_quantity: 0,
          };

          const response = await all_product_service.createNewProduct(
            db_user,
            all_product_details,
            item.images,
            createdByAdmin
          );
            console.log("response from food sample", response)
          return res.send(response);
        } catch (error) {
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

module.exports = router;
