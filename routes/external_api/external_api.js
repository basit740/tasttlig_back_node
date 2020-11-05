"use strict";

const router = require('express').Router();
const external_api_service = require('../../services/external_api_service');

router.get("/kodidi/specials_list", async (req, res) => {
  try {
    const response = await external_api_service.getKodidiSpecialsList();
    return res.send(response);
  } catch (e) {
    res.send({
      success: false,
      message: e.message,
    });
  }
});

module.exports = router;