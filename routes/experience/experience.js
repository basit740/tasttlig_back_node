"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const experience_service = require("../../services/experience/experience");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");

// POST experience
router.post(
  "/experience/add",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      !req.body.images ||
      !req.body.title ||
      !req.body.nationality_id ||
      !req.body.price ||
      !req.body.style ||
      !req.body.start_date ||
      !req.body.end_date ||
      !req.body.start_time ||
      !req.body.end_time ||
      !req.body.capacity ||
      !req.body.is_restaurant_location ||
      !req.body.address ||
      !req.body.city ||
      !req.body.state ||
      !req.body.postal_code ||
      !req.body.country
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

      const experience_details = {
        experience_user_id: db_user.tasttlig_user_id,
        title: req.body.title,
        type: req.body.type,
        nationality_id: req.body.nationality_id,
        price: req.body.price,
        style: req.body.style,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        capacity: req.body.capacity,
        dress_code: req.body.dress_code,
        is_restaurant_location: req.body.is_restaurant_location,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        postal_code: req.body.postal_code,
        // is_food_service_requested: req.body.is_food_service_requested,
        // is_entertainment_service_requested: req.body.is_entertainment_service_requested,
        // is_venue_service_requested: req.body.is_venue_service_requested,
        // is_transport_service_requested: req.body.is_transport_service_requested,
        food_description: req.body.food_description,
        game_description: req.body.game_description,
        entertainment_description: req.body.entertainment_description,
        feature_description: req.body.feature_description,
        transport_description: req.body.transport_description,
        parking_description: req.body.parking_description,
        accessibility_description: req.body.accessibility_description,
        environmental_consideration_description:
          req.body.environmental_consideration_description,
        value_description: req.body.value_description,
        other_description: req.body.other_description,
      };

      const response = await experience_service.createNewExperience(
        db_user,
        experience_details,
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

// GET all experiences
router.get("/experience/all", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";
    const status_operator = "=";
    const experience_status = "ACTIVE";
    const filters = {
      nationalities: req.query.nationalities,
      radius: req.query.radius,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    const response = await experience_service.getAllExperience(
      status_operator,
      experience_status,
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

// GET nationalities for experiences
router.get("/experience/nationalities", async (req, res) => {
  try {
    const status_operator = "=";
    const food_sample_status = "ACTIVE";

    const response = await experience_service.getDistinctNationalities(
      status_operator,
      food_sample_status
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

// GET experience by ID
router.get("/experience/:experience_id", async (req, res) => {
  if (!req.params.experience_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await experience_service.getExperience(
      req.params.experience_id
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

// GET all experiences from a user
/* router.get(
  "/experience/user/all",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      console.log(req.query);
      const current_page = req.query.page || 1;
      const keyword = req.query.keyword || "";
      const status_operator = "!=";
      const experience_status = "ARCHIVED";
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );
      const festival_id = req.query.festival;

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

      const response = await experience_service.getAllUserExperience(
        req.user.id,
        status_operator,
        experience_status,
        keyword,
        current_page,
        requestByAdmin,
        festival_id
      );

      return res.send(response);
    } catch (error) {
      console.log(error);
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
); */

// GET experience owner
router.get("/experience/owner/:id", async (req, res) => {
  try {
    const user_id = req.params.id;
    const current_page = req.query.page || 1;
    const keyword = "";
    const status_operator = "=";
    const experience_status = "ACTIVE";
    const requestByAdmin = false;

    const response = await experience_service.getAllUserExperience(
      user_id,
      status_operator,
      experience_status,
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
});

// GET business name for experience
router.get("/experience/business/:business_name", async (req, res) => {
  try {
    const business_name = req.params.business_name;
    const current_page = req.query.page || 1;
    const keyword = "";
    const status_operator = "=";
    const experience_status = "ACTIVE";
    const requestByAdmin = false;

    const user = await authentication_service.findUserByBusinessName(
      business_name
    );

    if (!user.success) {
      res.send({
        success: false,
        message: "Error.",
        response: "Invalid business name.",
      });
    }

    const response = await experience_service.getAllUserExperience(
      user.user.tasttlig_user_id,
      status_operator,
      experience_status,
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
});

// GET all archived experiences from a user
router.get(
  "/experience/user/archived",
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

      const response = await experience_service.getAllUserExperience(
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

// PUT experience review
router.put(
  "/experience/review",
  token_service.verifyTokenForReview,
  async (req, res) => {
    if (!req.body.experience_update_data) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    try {
      const response = await experience_service.updateReviewExperience(
        req.details.id,
        req.details.user_id,
        req.body.experience_update_data
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

// POST experience into festival
router.post(
  "/experiences/festival/:festivalId",
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
      let result = "";
      const response = await experience_service.addExperienceToFestival(
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

// PUT experience update
router.put(
  "/experience/update/:experience_id",
  token_service.authenticateToken,
  async (req, res) => {
    console.log("exp******", req.body);
    if (!req.params.experience_id || !req.body) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }
    const experience_update_data = req.body;
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

      let updatedByAdmin = false;
      let db_user = user_details_from_db.user;
      let user_role_object = db_user.role;

      if (user_role_object.includes("ADMIN")) {
        updatedByAdmin = true;
      }

      const response = await experience_service.updateExperience(
        db_user,
        req.params.experience_id,
        experience_update_data,
        updatedByAdmin
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

// DELETE experience
router.delete(
  "/experience/delete/:experience_id",
  token_service.authenticateToken,
  async (req, res) => {
    if (!req.params.experience_id) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    try {
      const response = await experience_service.deleteExperience(
        req.user.id,
        req.params.experience_id
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

// For multiple deletions of experiences
router.delete("/experience/delete/user/:user_id", async (req, res) => {
  // console.log("delete items coming from expereineces:", req.body.delete_items)
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    console.log("fe bdy", req.body);
    const response = await experience_service.deleteFoodExperiences(
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

// GET all experiences from a user
router.get(
  "/experience/user/all",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      console.log(req.query);
      const current_page = req.query.page || 1;
      const keyword = req.query.keyword || "";
      const status_operator = "!=";
      const experience_status = "ARCHIVED";
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );
      const festival_id = req.query.festival;
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
      const response = await experience_service.getAllUserExperience(
        req.user.id,
        status_operator,
        experience_status,
        keyword,
        current_page,
        requestByAdmin,
        festival_id
      );
      return res.send(response);
    } catch (error) {
      console.log(error);
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

module.exports = router;
