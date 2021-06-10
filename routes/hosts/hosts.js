"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const hosts_service = require("../../services/hosts/hosts");
const business_passport_service = require("../../services/passport/businessPassport");
const user_profile_service = require("../../services/profile/user_profile");
const user_order_service = require("../../services/payment/user_orders");

// GET applications
router.get(
  "/applications",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const applications = await hosts_service.getHostApplications();
      return res.send(applications);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// GET all host applications only
router.get(
  "/all-host-applications",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const applications = await hosts_service.getAllHostApplications();
      return res.send(applications);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// GET all applications by user ID
router.get(
  "/applications/:userId",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const application = await hosts_service.getHostApplication(
        req.params.userId
      );

      return res.send(application);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// POST application approval from admin
router.post(
  "/applications/:userId/approve",
  token_service.authenticateToken,
  async (req, res) => {

    try {
      const response = await user_profile_service.approveOrDeclineHostAmbassadorApplication(
        req.params.userId,
        "APPROVED"
      );
      return res.send(response);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// POST business member application approval from admin
router.post(
  "/business-member-applications/:userId/approve",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      // console.log("here rest");
      const businessDetails = await business_passport_service.getBusinessApplicantDetails(
        req.params.userId
      );

      // console.log("business details after approval:", businessDetails.application)

      const response = await business_passport_service.approveOrDeclineBusinessMemberApplication(
        req.params.userId,
        "APPROVED",
        "",
        businessDetails
      );

      return res.send(response);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// POST application decline from admin
router.post(
  "/business-member-applications/:userId/decline",
  token_service.authenticateToken,
  async (req, res) => {
    try {


      const response = await business_passport_service.approveOrDeclineBusinessMemberApplication(
        req.params.userId,
        "DECLINED",
        req.body.declineReason
      );

      return res.send(response);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// POST application decline from admin
router.post(
  "/applications/:userId/decline",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const response = await user_profile_service.approveOrDeclineHostAmbassadorApplication(
        req.params.userId,
        "DECLINED",
        req.body.declineReason
      );
      return res.send(response);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// POST application from multi-step form
router.post(
  "/request-host",
  /* token_service.authenticateToken, */ async (req, res) => {
    const {
      host_user_id,
      host_video_url,
      host_description,
      has_hosted_anything_before,
      have_a_restaurant,
      cuisine_type,
      seating_option,
      want_people_to_discover_your_cuisine,
      able_to_provide_food_samples,
      is_host,
      has_hosted_other_things_before,
      able_to_explain_the_origins_of_tasting_samples,
      able_to_proudly_showcase_your_culture,
      able_to_provie_private_dining_experience,
      able_to_provide_3_or_more_course_meals_to_guests,
      able_to_provide_live_entertainment,
      able_to_provide_other_form_of_entertainment,
      able_to_abide_by_health_safety_regulations,
      hosted_tasttlig_festival_before,
      able_to_provide_excellent_customer_service,
      able_to_provide_games_about_culture_cuisine,
      subscriptionResponse,
    } = req.body;
    try {
      if (!host_video_url || !host_description) {
        return res.status(403).json({
          success: false,
          message: "Required parameters are not available in request.",
        });
      }

      const host_details = {
        host_user_id: host_user_id ? host_user_id : null,
        host_video_url,
        host_description,
        has_hosted_anything_before,
        have_a_restaurant,
        cuisine_type,
        seating_option,
        want_people_to_discover_your_cuisine,
        able_to_provide_food_samples,
        has_hosted_other_things_before,
        able_to_explain_the_origins_of_tasting_samples,
        able_to_proudly_showcase_your_culture,
        able_to_provie_private_dining_experience,
        able_to_provide_3_or_more_course_meals_to_guests,
        able_to_provide_live_entertainment,
        able_to_provide_other_form_of_entertainment,
        able_to_abide_by_health_safety_regulations,
        hosted_tasttlig_festival_before,
        able_to_provide_excellent_customer_service,
        able_to_provide_games_about_culture_cuisine,
      };
      const creatingFreeOrder = await user_order_service.createFreeOrder(
        subscriptionResponse,
        host_user_id
      );
      if (!creatingFreeOrder.success) {
        return res.status(200).json({
          success: false,
          message: creatingFreeOrder.details,
        });
      }
      const response = await hosts_service.createHost(
        host_details,
        is_host,
        req.body.email
      );
      if (response.success) {
        return res.send(response);
      }
      return res.status(500).send(response);
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error,
      });
    }
  }
);

router.get(
  "/business-member-applications",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const applications = await business_passport_service.getBusinessApplications(
        req.params.userId
      );

      return res.send(applications);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

router.get(
  "/business-application/:userId",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const applications = await business_passport_service.getBusinessApplicantDetails(
        req.params.userId
      );

      return res.send(applications);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);



// GET guest ambassador applications
router.get(
  "/guest/amb/applications",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const applications = await hosts_service.getGuestAmbassadorApplications();

      return res.send(applications);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// GET all guest amb applications by user ID
router.get(
  "/guest-amb-application/:appId",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const application = await hosts_service.getGuestAmbassadorApplication(
        req.params.appId
      );

      return res.send(application);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post(
  "/applications/:userId/:appId/approve",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const response = await user_profile_service.approveOrDeclineGuestAmbassadorSubscription(
        req.params.userId,
        req.params.appId,
        "APPROVED",
        req.body
      );
      return res.send(response);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post(
  "/applications/:userId/:appId/decline",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const response = await user_profile_service.approveOrDeclineGuestAmbassadorSubscription(
        req.params.userId,
        req.params.appId,
        "DECLINED",
        req.body
      );
      return res.send(response);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
