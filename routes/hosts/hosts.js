"use strict"

const router = require('express').Router();

const token_service = require("../../services/authentication/token");
const hosts_service = require("../../services/hosts/hosts");
const user_profile_service = require("../../services/profile/user_profile");

router.get("/applications", token_service.authenticateToken, async (req, res) => {
  try{
    const applications = await hosts_service.getHostApplications();
    return res.send(applications);
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message
    });
  }
});

// GET all applications by user ID
router.get("/applications/:userId", token_service.authenticateToken, async (req, res) => {
  try{
    const application = await hosts_service.getHostApplication(req.params.userId);
    return res.send(application);
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message
    });
  }
});

// Approve application from admin
router.post("/applications/:userId/approve", token_service.authenticateToken, async (req, res) => {
  try {
    const response = await user_profile_service.approveOrDeclineHostApplication(req.params.userId, "APPROVED");
    return res.send(response);
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message
    });
  }
});

// Decline application from admin
router.post("/applications/:userId/decline", token_service.authenticateToken, async (req, res) => {
  try {
    const response = await user_profile_service.approveOrDeclineHostApplication(
      req.params.userId,
      "DECLINED",
      req.body.declineReason
    );

    return res.send(response);
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
