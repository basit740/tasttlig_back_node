"use strict";
// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const mypassports_service = require("../../services/mypassports/mypassports");

// GET passports from user
router.get("/mypassports/:userId", async (req, res) => {
  try {
    const response = await mypassports_service.getPassportsFromUser(
      req.params.userId
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

// GET passports from user sorted by festivals
router.get("/mypassports/sortfest/:userId", async (req, res) => {
  try {
    const response =
      await mypassports_service.getPassportsFromUserSortByFestival(
        req.params.userId
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
