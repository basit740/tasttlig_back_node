"use strict";
// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const follow_interest_service = require("../../services/follow_interest/follow_interest");

// increment interested column in festivals table
// bug that needs fixing
router.put("/festivals-interested", async (req, res) => {
  console.log("ROUTER PUT INSIDE INTERESTED");
  try {
    const response = await follow_interest_service.addToInterested(
      req.body.festivalId,
    );
    console.log("THE PUT ROUTE RESPONSE IS ", response);
    return res.send(response);
  } catch (error) {
    console.log("THE PUT ROUTE ERROR IS ", error.message);
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

module.exports = router;
