"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const food_sample_service = require("../../services/food_sample/food_sample");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const festival_service = require("../../services/festival/festival");
const {
  generateRandomString,
  formatTime,
} = require("../../functions/functions");
const auth_server_service = require("../../services/authentication/auth_server_service");
const all_product_service = require("../../services/allProducts/all_product");

// Environment variables
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// POST food sample
router.post(
  "/food-sample/add",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      req.body.map(async (item) => {
        if (
          !item.title ||
          !item.festivals ||
          !item.sample_size ||
          !item.quantity ||
          // !item.city ||
          !item.description ||
          !item.images ||
          //!item.product_expiry_date ||
          // !item.end_date ||
          //!item.product_expiry_time ||
          !item.end_time ||
          !item.start_time ||
          !item.nationality_id
        ) {
          return res.status(403).json({
            success: false,
            message: "Required parameters are not available in request.",
          });
        }

        /* let address = item.addressLine1;
        if (item.addressLine2 && item.addressLine2.length > 0) {
          address = `${address}, ${item.addressLine2}`;
        } */

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

            const host_details_from_db =
              await user_profile_service.getUserByEmail(item.userEmail);
            db_user = host_details_from_db.user;
            createdByAdmin = true;
          }

          const all_product_details = {
            product_user_id: db_user.tasttlig_user_id,
            title: item.title,
            // start_date: item.start_date.substring(0, 10),
            // end_date: item.end_date.substring(0, 10),
            start_time:
              item.start_time.length === 5
                ? item.start_time
                : formatTime(item.start_time),
            end_time:
              item.end_time.length === 5
                ? item.end_time
                : formatTime(item.end_time),
            description: item.description,
            // address: item.address ? item.address : address,
            // city: item.city,
            // state: item.state ? item.state : item.provinceTerritory,
            // country: "Canada",
            // postal_code: item.postal_code,
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
            // food_sample_type: item.food_sample_type,
            price: 0.0,
            quantity: parseInt(item.quantity),
            food_ad_code: generateRandomString(4),
            status: "ACTIVE",
            // festival_id: item.addToFestival ? 2 : null,
            festival_selected: item.festivals,
            claimed_total_quantity: 0,
            redeemed_total_quantity: 0,
          };

          const response = await food_sample_service.createNewFoodSample(
            db_user,
            all_product_details,
            item.images,
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
router.post("/food-sample/noUser/add", async (req, res) => {
  try {
    req.body.map(async (item) => {
      if (
        !item.title ||
        !item.festivals ||
        !item.sample_size ||
        !item.quantity ||
        !item.city ||
        !item.description ||
        !item.images ||
        //!item.product_expiry_date ||
        !item.end_date ||
        //!item.product_expiry_time ||
        !item.end_time ||
        !item.nationality_id
      ) {
        return res.status(403).json({
          success: false,
          message: "Required parameters are not available in request.",
        });
      }

      /* let address = item.addressLine1;
        if (item.addressLine2 && item.addressLine2.length > 0) {
          address = `${address}, ${item.addressLine2}`;
        } */

      try {
        /* const user_details_from_db = await user_profile_service.getUserById(
            req.user.id
          );

          if (!user_details_from_db.success) {
            return res.status(403).json({
              success: false,
              message: user_details_from_db.message,
            });
          } */
        const user_details_from_db = await user_profile_service.getUserByEmail(
          item.userEmail
        );
        let createdByAdmin = false;
        let db_user = user_details_from_db.user;
        /* let user_role_object = db_user.role;

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
          } */

        const food_sample_details = {
          food_sample_creater_user_id: db_user.tasttlig_user_id,
          title: item.title,
          start_date: item.start_date.substring(0, 10),
          end_date: item.end_date.substring(0, 10),
          start_time:
            item.start_time.length === 5
              ? item.start_time
              : formatTime(item.start_time),
          end_time:
            item.end_time.length === 5
              ? item.end_time
              : formatTime(item.end_time),
          description: item.description,
          address: item.address ? item.address : address,
          city: item.city,
          state: item.state ? item.state : item.provinceTerritory,
          country: "Canada",
          postal_code: item.postal_code,
          nationality_id: item.nationality_id,
          sample_size: item.sample_size,
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
          // food_sample_type: item.food_sample_type,
          price: 2.0,
          quantity: parseInt(item.quantity),
          food_ad_code: generateRandomString(4),
          status: "ACTIVE",
          festival_id: item.addToFestival ? 2 : null,
          festival_selected: item.festivals,
        };

        const response = await food_sample_service.createNewFoodSample(
          db_user,
          food_sample_details,
          item.images,
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
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error,
    });
  }
});

// // POST food samples from Host multi-step form helper function
// router.post("/food-samples/add", async (req, res) => {
//   try {
//     req.body.map(async (item) => {
//       if (
//         !item.title ||
//         !item.sample_size ||
//         !item.quantity ||
//         !item.city ||
//         !item.postal_code ||
//         !item.description ||
//         !item.images ||
//         !item.start_date ||
//         !item.end_date ||
//         !item.start_time ||
//         !item.end_time ||
//         !item.nationality_id
//       ) {
//         return res.status(403).json({
//           success: false,
//           message: "Required parameters are not available in request.",
//         });
//       }

//       let address = item.addressLine1;

//       if (item.addressLine2 && item.addressLine2.length > 0) {
//         address = `${address}, ${item.addressLine2}`;
//       }

//       try {
//         let dbUser = await user_profile_service.getUserByPassportIdOrEmail(
//           item.email
//         );
//         item.dbUser = dbUser;
//         let createdByAdmin = true;

//         const food_sample_details = {
//           food_sample_creater_user_id: item.dbUser.user.tasttlig_user_id,
//           title: item.title,
//           start_date: item.start_date.substring(0, 10),
//           end_date: item.end_date.substring(0, 10),
//           start_time:
//             item.start_time.length === 5
//               ? item.start_time
//               : formatTime(item.start_time),
//           end_time:
//             item.end_time.length === 5
//               ? item.end_time
//               : formatTime(item.end_time),
//           description: item.description,
//           address: item.address ? item.address : address,
//           city: item.city,
//           state: item.state ? item.state : item.provinceTerritory,
//           country: "Canada",
//           postal_code: item.postal_code,
//           nationality_id: item.nationality_id,
//           sample_size: item.sample_size,
//           is_available_on_monday: item.daysAvailable.includes(
//             "available_on_monday"
//           ),
//           is_available_on_tuesday: item.daysAvailable.includes(
//             "available_on_tuesday"
//           ),
//           is_available_on_wednesday: item.daysAvailable.includes(
//             "available_on_wednesday"
//           ),
//           is_available_on_thursday: item.daysAvailable.includes(
//             "available_on_thursday"
//           ),
//           is_available_on_friday: item.daysAvailable.includes(
//             "available_on_friday"
//           ),
//           is_available_on_saturday: item.daysAvailable.includes(
//             "available_on_saturday"
//           ),
//           is_available_on_sunday: item.daysAvailable.includes(
//             "available_on_sunday"
//           ),
//           is_vegetarian: item.dietaryRestrictions.includes("vegetarian"),
//           is_vegan: item.dietaryRestrictions.includes("vegan"),
//           is_gluten_free: item.dietaryRestrictions.includes("glutenFree"),
//           is_halal: item.dietaryRestrictions.includes("halal"),
//           spice_level: item.spice_level,
//           // food_sample_type: item.food_sample_type,
//           price: 2.0,
//           quantity: parseInt(item.quantity),
//           food_ad_code: generateRandomString(4),
//           status: "ACTIVE",
//           festival_id: item.addToFestival ? 2 : null,
//         };

//         const response = await food_sample_service.createNewFoodSample(
//           dbUser,
//           food_sample_details,
//           item.images,
//           createdByAdmin
//         );

//         return res.send(response);
//       } catch (error) {
//         res.send({
//           success: false,
//           message: "Error.",
//           response: error,
//         });
//       }
//     });
//   } catch (error) {
//     res.send({
//       success: false,
//       message: "Error.",
//       response: error,
//     });
//   }
// });

// GET all food samples
router.get("/food-sample/all", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";
    const status_operator = "=";
    const food_sample_status = "ACTIVE";
    const food_ad_code = req.query.food_ad_code;

    const filters = {
      nationalities: req.query.nationalities,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      radius: req.query.radius,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
      quantity: req.query.quantity,
      festival_name: req.query.festival_name,
    };

    const response = await food_sample_service.getAllFoodSamples(
      status_operator,
      food_sample_status,
      keyword,
      current_page,
      food_ad_code,
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
// GET all food samples in festival
router.get("/food-sample/festival/:festivalId", async (req, res) => {
  try {
    //const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";
    const status_operator = "=";
    const food_sample_status = "ACTIVE";
    //const food_ad_code = req.query.food_ad_code;

    const filters = {
      /*       nationalities: req.query.nationalities,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      radius: req.query.radius,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
      quantity: req.query.quantity,
      festival_name: req.query.festival_name, */
      price: req.query.price,
      quantity: req.query.quantity,
      size: req.query.size,
      dayOfWeek: req.query.dayOfWeek,
    };
    /*     const festival = await festival_service.getFestivalDetails(
      req.params.festivalId
    );
    const festival_title = festival.details.festival_name */
    //console.log("festival_title",festival_title);
    const response = await food_sample_service.getAllFoodSamplesInFestival(
      status_operator,
      food_sample_status,
      keyword,
      //current_page,
      //food_ad_code,
      filters,
      req.params.festivalId
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

// GET nationalities for food samples
router.get("/food-sample/nationalities", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const selectedNationality = req.query.selectedNationality || [];
    const status_operator = "=";
    const food_sample_status = "ACTIVE";
    let alreadySelectedNationalityList = [];

    selectedNationality.map((nationality) => {
      alreadySelectedNationalityList.push(
        JSON.parse(nationality).value.nationality
      );
    });


    const response = await food_sample_service.getDistinctNationalities(
      status_operator,
      food_sample_status,
      keyword,
      alreadySelectedNationalityList
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

router.get("/food-sample/user-nationalities", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const response = await food_sample_service.getNationalities(keyword);
    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists.",
      });
    }
  } catch (error) {
  }
});

// GET food sample by ID
router.get("/food-sample/:food_sample_id", async (req, res) => {
  if (!req.params.food_sample_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await food_sample_service.getFoodSample(
      req.params.food_sample_id
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

// GET Google Maps API key
router.get("/food-sample/googleMaps/api", (req, res) => {
  const response = GOOGLE_MAPS_API_KEY;

  return res.send(response);
});

// GET all food samples from user
router.get(
  "/food-sample/user/all",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      // console.log("what is the request bro:", req)
      const current_page = req.query.page || 1;
      const keyword = req.query.keyword || "";
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

      const response = await food_sample_service.getAllUserFoodSamples(
        req.user.id,
        status_operator,
        food_sample_status,
        keyword,
        current_page,
        requestByAdmin
      );
      // console.log("response from food samples:", response);
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

// GET all food samples from user not in festival
router.get(
  "/food-sample/festival/user/all",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const current_page = req.query.page || 1;
      const keyword = req.query.keyword || "";
      const festival_name = req.query.festival_name || "";
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

      const response =
        await food_sample_service.getAllUserFoodSamplesNotInFestival(
          req.user.id,
          status_operator,
          food_sample_status,
          keyword,
          current_page,
          requestByAdmin,
          festival_name
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

// GET food sample owner
router.get("/food-sample/owner/:owner_id", async (req, res) => {
  if (!req.params.owner_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";
    const status_operator = "=";
    const food_sample_status = "ACTIVE";

    const food_sample_response = await food_sample_service.getproductOwnerInfo(
      req.params.owner_id,
      status_operator,
      food_sample_status,
      keyword,
      current_page
    );

    const db_products = food_sample_response.details;

    const user_details_response = await user_profile_service.getUserById(
      req.params.owner_id
    );

    if (!user_details_response.success) {
      return res.status(403).json({
        success: false,
        message: user_details_response.message,
      });
    }

    const db_user = user_details_response.user;

    return res.send({
      success: true,
      owner_user: db_user,
      food_samples: db_products,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET business name for food sample
router.get("/food-sample/business/:business_name", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";
    const status_operator = "=";
    const food_sample_status = "ACTIVE";

    const user = await authentication_service.findUserByBusinessName(
      req.params.business_name
    );

    if (!user.success) {
      res.send({
        success: false,
        message: "Error.",
        response: "Invalid business name.",
      });
    }

    const food_sample_response =
      await food_sample_service.getAllUserFoodSamples(
        user.user.tasttlig_user_id,
        status_operator,
        food_sample_status,
        keyword,
        current_page
      );

    const db_food_samples = food_sample_response.details;

    return res.send({
      success: true,
      owner_user: user.user,
      food_samples: db_food_samples,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET all archived food samples from a user
router.get(
  "/food-sample/user/archived",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const current_page = req.query.page || 1;
      const keyword = req.query.keyword || "";
      const status_operator = "=";
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

      const response = await food_sample_service.getAllUserFoodSamples(
        req.user.id,
        status_operator,
        food_sample_status,
        keyword,
        current_page,
        requestByAdmin
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

// POST food sample to festival
router.post(
  "/food-sample/add-festival",
  token_service.authenticateToken,
  async (req, res) => {
    if (!req.body.food_sample_id || !req.body.festival_name) {
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

      let requestByAdmin = false;
      let db_user = user_details_from_db.user;
      let user_role_object = db_user.role;

      if (user_role_object.includes("ADMIN")) {
        requestByAdmin = true;
      }

      const response = await food_sample_service.addFoodSampleToFestival(
        req.body.food_sample_id,
        req.user.id,
        req.user.email,
        req.body.festival_name,
        requestByAdmin
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

// PUT food sample review
router.put(
  "/food-sample/review",
  token_service.verifyTokenForReview,
  async (req, res) => {
    if (!req.body.food_sample_update_data) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    try {
      const response = await food_sample_service.updateReviewFoodSample(
        req.details.id,
        req.details.user_id,
        req.body.food_sample_update_data
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

// PUT food sample update
router.put(
  "/food-sample/update/:food_sample_id",
  token_service.authenticateToken,
  async (req, res) => {
    if (!req.params.food_sample_id || !req.body.food_sample_update_data) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    try {
      const user_details_response = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_response.success) {
        return res.status(403).json({
          success: false,
          message: user_details_response.message,
        });
      }

      let updatedByAdmin = false;
      let db_user = user_details_response.user;
      let user_role_object = db_user.role;

      if (user_role_object.includes("ADMIN")) {
        updatedByAdmin = true;
      }

      const prev_product_details = await all_product_service.getProductById(
        req.params.food_sample_id
      );
      const response = await food_sample_service.updateFoodSample(
        db_user,
        req.params.food_sample_id,
        req.body.food_sample_update_data,
        updatedByAdmin
      );
      res.send(response);
      const send_to_central_server =
        await auth_server_service.editProductInCentralServer(
          db_user.email,
          prev_product_details,
          req.body.food_sample_update_data
        );
      return {
        success: true,
      };
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

// DELETE food sample
router.delete(
  "/food-sample/delete/:food_sample_id",
  token_service.authenticateToken,
  async (req, res) => {
    if (!req.params.food_sample_id) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    try {
      const response = await food_sample_service.deleteFoodSample(
        req.user.id,
        req.params.food_sample_id
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
// For multiple deletions of food sample
router.delete("/food-sample/delete/user/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const user = await user_profile_service.getUserById(req.params.user_id);
    const response = await food_sample_service.deleteFoodSamplesFromUser(
      req.params.user_id,
      req.body.delete_items
    );
    res.send(response);
    const delete_central_server =
      await auth_server_service.deleteProductInCentralServer(
        user.user.email,
        req.body.delete_items
      );
    return {
      success: true,
    };
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

module.exports = router;
