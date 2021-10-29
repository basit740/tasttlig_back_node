"use strict";
// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const mypassports_service = require("../../services/mypassports/mypassports");

// GET passports from user
// bug: 404 error that needs fixing
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

module.exports = router;
