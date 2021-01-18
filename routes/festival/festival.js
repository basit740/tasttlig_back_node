"use strict";
// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const food_sample_claim_service = require("../../services/food_sample_claim/food_sample_claim");
const user_profile_service = require("../../services/profile/user_profile");
const food_sample_service = require("../../services/food_sample/food_sample");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const festival_service = require("../../services/festival/festival");

router.get("/get-festivals", async (req, res) => {
  const festivals = await festival_service.getAllFestivals();
  return res.send(festivals);
});

module.exports = router;