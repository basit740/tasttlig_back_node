"use strict";
// Libraries
const router = require("express").Router();
const featured_artists_service = require("../../services/featured_artists/featured_artists");

// get artists from featured_artists table
router.get("/featured-artists", async (req, res) => {
  try {
    const response = await featured_artists_service.getFeaturedArtists();
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
