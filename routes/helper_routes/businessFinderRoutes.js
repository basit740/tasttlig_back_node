"use strict";

const router = require('express').Router();
const business_finder_service = require("../../services/helper_functions/business_finder");

router.get("/:keyword", async (req, res) => {
  if (!req.params.keyword) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request."
    });
  }
  try {
    const response = await business_finder_service.getTopBusinessSuggestions(req.params.keyword);
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err
    });
  }
})

router.get("/festival/restaurants", async (req, res) => {
  try {
    const response = await business_finder_service.getFestivalRestaurants();
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err
    });
  }
})

module.exports = router;