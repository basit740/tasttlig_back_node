"use strict";

// Libraries
const router = require("express").Router();
const nationality_service = require("../../services/helper_functions/nationality");

// GET all nationalities
router.get("/", async (req, res) => {
  try {
    const response = await nationality_service.getAll();

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
