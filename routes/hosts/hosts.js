"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const hosts_service = require("../../services/hosts/hosts");
const user_profile_service = require("../../services/profile/user_profile");

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
      const response = await user_profile_service.approveOrDeclineHostApplication(
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

// POST application decline from admin
router.post(
  "/applications/:userId/decline",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const response = await user_profile_service.approveOrDeclineHostApplication(
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
router.post("/request-host", token_service.authenticateToken, async (req, res) => {
  // console.log("req from host:", req.body)
  const {  host_user_id,
    host_video_url,
    host_description,
    host_government_id_url } = req.body;
  try {
    
    if (
      !host_video_url ||
      !host_description ||
      !host_government_id_url 
      
    ) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }
    
    const host_details = {
      host_user_id,
      host_video_url,
      host_description,
      host_government_id_url
    };

    const response = await hosts_service.createHost(
      host_details, 
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
});




module.exports = router;
