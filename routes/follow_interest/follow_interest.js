"use strict";
// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const follow_interest_service = require("../../services/follow_interest/follow_interest");

// increment interested column in festivals table
router.put("/festivals-interested", async (req, res) => {
  try {
    const response = await follow_interest_service.addToInterested(
      req.body.festivalId
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
