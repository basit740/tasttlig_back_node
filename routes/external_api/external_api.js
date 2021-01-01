"use strict";

// Libraries
const router = require("express").Router();
const external_api_service = require("../../services/external_api_service");
const token_service = require("../../services/authentication/token");

// GET specials list from Kodidi
router.get("/kodidi/specials_list", async (req, res) => {
  try {
    const response = await external_api_service.getKodidiSpecialsList();

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// GET user specials list from Kodidi
router.get(
  "/kodidi/user_specials_list",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const response = await external_api_service.getKodidiUserSpecialsList(
        req.user.email
      );

      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
