"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const services_service = require("../../services/services/services");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const auth_service = require("../../services/authentication/auth_server_service");
const festival_service = require("../../services/festival/festival");
const business_service = require("../../services/passport/businessPassport");
const { generateRandomString } = require("../../functions/functions");

// POST services
router.post(
  "/services/add",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      !req.body.service_name ||
      !req.body.service_capacity ||
      !req.body.service_size_scope ||
      !req.body.service_description ||
      !req.body.service_images ||
      !req.body.service_type ||
      !req.body.start_time ||
      !req.body.end_time
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

      const business_details_from_db =
        await authentication_service.getUserByBusinessDetails(req.user.id);


      const service_information = {
        service_business_id: req.body.business_id,
        service_name: req.body.service_name,
        service_nationality_id: req.body.service_nationality_id
          ? req.body.service_nationality_id
          : null,
        promotion: req.body.service_offering_type,
        service_price: req.body.service_price ? req.body.service_price : 2,
        service_capacity: req.body.service_capacity,
        service_size_scope: req.body.service_size_scope,
        service_type: req.body.service_type,
        service_description: req.body.service_description,
        additional_information: req.body.additional_information,
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
      };
       // update the service_information.festival_selected from slug to numerical festival id
   
       service_information.festivals_selected = [ req.body.festivals_selected[0] ];
      const response = await services_service.createNewService(
        user_details_from_db,
        service_information,
        req.body.service_images
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
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET all services globally
router.get("/services/all", async (req, res) => {
  const filters = {
    price: req.query.price,
    quantity: req.query.quantity,
    size: req.query.size,
  };

  try {
    const response = await services_service.getAllServices(
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

// POST services
router.post(
  "/services/festival/:festivalId",
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


      const db_festival = await festival_service.getFestivalDetailsBySlug(
        req.body.festivalId
       );

      let result = "";
      const response = await services_service.addServiceToFestival(
        db_festival.details[0].festival_id,
        req.body.ps,
        req.user.id,
        user_details_from_db
      );
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
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

router.get("/services/business/:business_id", async (req, res) => {
  if (!req.params.business_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await services_service.getBusinessServiceDetails(
      req.params.business_id,
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

      const response = await services_service.updateService(req.body);
      res.send(response);

      return {
        success: true,
      };
      //return res.send({ success: false });
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
      let serviceArr = [];
      for (let service of req.body.service_id) {
        let service_info = await services_service.findService(Number(service));
        serviceArr.push(service_info.details);
      }
      const response = await services_service.deleteService(
        req.user.id,
        req.body.service_id
      );
      res.send(response);
      const delete_central_server =
        await auth_service.deleteServiceInCentralServer(
          req.user.email,
          serviceArr
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

module.exports = router;
