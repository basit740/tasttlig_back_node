"use strict";

// Libraries
const router = require("express").Router();
const business_finder_service = require("../../services/helper_functions/business_finder");

// GET keyword for businesses
router.get("/:keyword", async (req, res) => {
  if (!req.params.keyword) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await business_finder_service.getTopBusinessSuggestions(
      req.params.keyword
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error,
    });
  }
});

// GET restaurants for festival
router.get("/festival/restaurants", async (req, res) => {
  try {
    const response = await business_finder_service.getFestivalRestaurants();

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error,
    });
  }
});
router.get("/all/restaurants", async (req, res) => {
  try {
    const response = await business_finder_service.getAllRestaurants(
      req.query.keyword
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error,
    });
  }
});

module.exports = router;
