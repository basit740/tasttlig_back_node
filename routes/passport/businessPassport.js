"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const passport_service = require("../../services/passport/businessPassport");
const user_profile_service = require("../../services/profile/user_profile");

// GET all passport details
router.post("/business-passport", async (req, res) => {
  try {
    const userId = req.query.userId;
    const current_page = req.query.page || 1;

    const response = await passport_service.postBusinessPassportDetails(
      userId,
      req.body
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

module.exports = router;
