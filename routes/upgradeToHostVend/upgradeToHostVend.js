"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const user_profile_service = require("../../services/profile/user_profile");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const authentication_service = require("../../services/authentication/authenticate_user");
const upgrade_service = require("../../services/upgradeToHostVend/upgradeToHostVend");
const host_service = require("../../services/hosts/hosts");



router.get(
    "/host-application/:userId",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const applications = await host_service.getHostApplicantDetails(
          req.params.userId
        );
  
        return res.send(applications);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  router.get(
    "/vendor-application/:userId",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const applications = await upgrade_service.getVendorApplicantDetails(
          req.params.userId
        );
  
        return res.send(applications);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );



  router.get(
    "/all-vendor-applications",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const applications = await upgrade_service.getAllVendorApplications();
        console.log("response from here:", applications);
        return res.send(applications);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

router.post(
    "/upgrade/vendor-to-host",
    token_service.authenticateToken,
    async (req, res) => {
      console.log("body from front: ", req.body)
      try {
        const response = await upgrade_service.upgradeApplication(
          req.body
        );
        if (!response.success) {
          return res.status(200).json({
            success: false,
            message: response.details,
          });
        }
        console.log(response);
        return res.send(response);
      } catch (error) {
        console.log("error from catch:", error);
        return res.status(403).json({
          success: false,
          message: error.details,
        });
      }
    }
  );

  router.post(
    "/upgrade/business-to-host",
    token_service.authenticateToken,
    async (req, res) => {
      console.log("body from front: ", req.body)
      try {
        const response = await upgrade_service.upgradeApplication(
          req.body
        );
        if (!response.success) {
          return res.status(200).json({
            success: false,
            message: response.details,
          });
        }
        console.log(response);
        return res.send(response);
      } catch (error) {
        console.log("error from catch:", error);
        return res.status(403).json({
          success: false,
          message: error.details,
        });
      }
    }
  );

  router.post(
    "/upgrade/business-to-vend",
    token_service.authenticateToken,
    async (req, res) => {
      console.log("body from front: ", req.body)
      try {
        const response = await upgrade_service.upgradeApplication(
          req.body
        );
        if (!response.success) {
          return res.status(200).json({
            success: false,
            message: response.details,
          });
        }
        console.log(response);
        return res.send(response);
      } catch (error) {
        console.log("error from catch:", error);
        return res.status(403).json({
          success: false,
          message: error.details,
        });
      }
    }
  );


  // POST vendor approval from admin
router.post(
    "/vendor-applications/:userId/approve",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        // console.log("here rest");
        const Details = await upgrade_service.getVendorApplicantDetails(
          req.params.userId
        );
  
        // console.log("business details after approval:", businessDetails.application)
  
        const response = await upgrade_service.approveOrDeclineHostVendorApplication(
          req.params.userId,
          "APPROVED",
          "",
          Details
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


    // POST host approval from admin
router.post(
    "/host-applications/:userId/approve",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        // console.log("here rest");
        const Details = await host_service.getHostApplicantDetails(
          req.params.userId
        );
  
        // console.log("business details after approval:", businessDetails.application)
  
        const response = await upgrade_service.approveOrDeclineHostVendorApplication(
          req.params.userId,
          "APPROVED",
          "",
          Details
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

// POST host application decline from admin
  router.post(
    "/host-upgrade-applications/:userId/decline",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const Details = await host_service.getHostApplicantDetails(
            req.params.userId
          );
  
        const response = await upgrade_service.approveOrDeclineHostVendorApplication(
          req.params.userId,
          "DECLINED",
          req.body.declineReason, Details
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


  // POST vend application decline from admin
  router.post(
    "/vendor-upgrade-applications/:userId/decline",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const Details = await upgrade_service.getVendorApplicantDetails(
            req.params.userId
          );
  
        const response = await upgrade_service.approveOrDeclineHostVendorApplication(
          req.params.userId,
          "DECLINED",
          req.body.declineReason, Details
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
