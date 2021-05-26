"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const sponsor_service = require("../../services/sponsor/sponsor");
const user_profile_service = require("../../services/profile/user_profile");

router.get(
  "/sponsor/user/:userId",
  token_service.authenticateToken,
  async (req, res) => {
    const { user_id } = req.body;
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

      const response = await sponsor_service.getUserSponsorships(
        req.user.id
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

router.get(
  "/all-sponsor-applications",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const applications = await sponsor_service.getAllSponsorApplications();
      console.log("response from app sponsor applications:", applications)
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
  "/sponsor-application/:userId",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const applications = await sponsor_service.getSponsorApplicantDetails(
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

  // POST vendor approval from admin
  router.post(
    "/sponsor-applications/:userId/approve",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        console.log("here rest");
        const Details = await sponsor_service.getSponsorApplicantDetails(
          req.params.userId
        );
  
  
        const response = await sponsor_service.approveOrDeclineSponsorApplication(
          req.params.userId,
          "APPROVED",
          "",
          Details
        );
        console.log("response sponsor-applications after approval:", response)
  
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
    "/sponsor-upgrade-applications/:userId/decline",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const Details = await sponsor_service.getSponsorApplicantDetails(
            req.params.userId
          );
  
        const response = await sponsor_service.approveOrDeclineSponsorApplication(
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


router.get(
  "/sponsor/inKind/user/:userId",
  token_service.authenticateToken,
  async (req, res) => {
    const { user_id } = req.body;
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

      const response = await sponsor_service.getInKindUserSponsorships(
        req.user.id
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

module.exports = router;