"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const services_service = require("../../services/services/services");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const { generateRandomString } = require("../../functions/functions");

// POST services
router.post(
  "/services/add",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      !req.body.service_name ||
      // !req.body.service_nationality_id ||
      // !req.body.service_price ||
      !req.body.service_capacity ||
      !req.body.service_size_scope ||
      !req.body.service_description ||
      !req.body.service_images ||
      !req.body.service_type ||
      !req.body.start_time ||
      !req.body.end_time
      //||
      //!req.body.service_festival_id ||
      // !req.body.service_creator_type
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

      const service_information = {
        service_business_id: createdByAdmin
          ? null
          : db_business_details.business_details_id,
        service_name: req.body.service_name,
        service_nationality_id: req.body.service_nationality_id
          ? req.body.service_nationality_id
          : null,
        service_price: req.body.service_price,
        service_capacity: req.body.service_capacity,
        service_size_scope: req.body.service_size_scope,
        service_type: req.body.service_type,
        service_description: req.body.service_description,
        festivals_selected: req.body.festival_selected,
        products_selected: req.body.products_selected,
        experiences_selected: req.body.experiences_selected,
        service_code: generateRandomString(4),
        service_status: "ACTIVE",
        service_created_at_datetime: new Date(),
        service_updated_at_datetime: new Date(),
        service_creator_type: req.body.service_creator_type
          ? req.body.service_creator_type
          : null,
        service_user_id: req.user.id,
      };
      const response = await services_service.createNewService(
        user_details_from_db,
        service_information,
        req.body.service_images
      );
      return res.send(response);
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

// GET services in specific festival
router.get("/services/festival/:festival_id", async (req, res) => {
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
    const response = await services_service.getServicesInFestival(
      req.params.festival_id,
      filters,
      req.query.keyword
    );
    // console.log('services in festival response', response);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// POST services
router.post(
  "/services/festival/:festivalId",
  token_service.authenticateToken,
  async (req, res) => {
    console.log(req.body);
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
      let result = "";
      const response = await services_service.addServiceToFestival(
        req.body.festivalId,
        req.body.ps
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

router.get("/services/details/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await services_service.getUserServiceDetails(
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

//Get services from user
router.get("/services/user/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const response = await services_service.getServicesFromUser(
      req.query.user_id,
      req.query.keyword,
      req.query.festival
    );
    console.log('fecthing services', response);
    console.log('fecthing service ID', req.query.user_id);
    return res.send(response);
    
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

router.delete("/services/delete/user/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const response = await services_service.deleteServicesFromUser(
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

// POST claim service in specific festival
router.post("/claim-service", async (req, res) => {
  const { service_claim_user, service_id } = req.body;

  if (!service_claim_user || !service_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    let db_user;
    let db_service;

    db_user = await user_profile_service.getUserByPassportIdOrEmail(
      service_claim_user
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: db_user.message,
      });
    }

    db_user = db_user.user;

    db_service = await services_service.findService(service_id);

    if (!db_service.success) {
      return res.status(403).json({
        success: false,
        message: db_service.message,
      });
    }

    const response = await services_service.claimService(db_user, service_id);

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
  "/service/update",
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

      const response = await services_service.updateService(db_user, req.body);

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

// DELETE service
router.delete(
  "/service/delete",
  token_service.authenticateToken,
  async (req, res) => {
    if (!req.body.service_id) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    try {
      const response = await services_service.deleteService(
        req.user.id,
        req.body.service_id
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
