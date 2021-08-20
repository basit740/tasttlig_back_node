"use strict";

// Libraries
const router = require("express").Router();
const {
  emailSupportService,
} = require("../../services/email/emailSupportService");

// route
router.post("/email-service", async (req, res) => {
  try {
    const response = await emailSupportService(req.body);

    return res.send({ success: true, message: response });
  } catch (error) {
    res.send({
      success: false,
      message: error,
    });
  }
});

module.exports = router;
