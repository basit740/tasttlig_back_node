"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const {
  emailSupportService,
} = require("../../services/email/emailSupportService");

// route
router.post(
  "/email-service",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const response = await emailSupportService(req.body);
      console.log("sendres", response);
      return res.send({ success: response.success, message: response });
    } catch (error) {
      res.send({
        success: false,
        message: error,
      });
    }
  }
);

module.exports = router;
