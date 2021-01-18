"use strict";
// Libraries
const router = require("express").Router();
const festival_service = require("../../services/festival/festival");

router.get("/get-festivals", async (req, res) => {
  const festivals = await festival_service.getAllFestivals();
  return res.send(festivals);
});

router.post("/festival/add", async (req, res) => {
  const newFestival = await festival_service.createNewFestival(req.body);
  console.log(req.body);
  return res.send(newFestival);
})

module.exports = router;