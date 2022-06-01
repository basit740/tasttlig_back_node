"use strict";
// Libraries
const router = require("express").Router();
const neighbourhood_service = require("../../services/neighbourhood/neighbourhood");



// count all likes from a festival id
router.get("/neighbourhood/all", async (req, res) => {
  try {
    const response = await neighbourhood_service.getAllNeighbourhood();
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
