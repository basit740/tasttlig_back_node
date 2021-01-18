"use strict";
// Libraries
const router = require("express").Router();
const festival_service = require("../../services/festival/festival");

router.get("/get-festivals", async (req, res) => {
  const festivals = await festival_service.getAllFestivals();
  return res.send(festivals);
});

module.exports = router;