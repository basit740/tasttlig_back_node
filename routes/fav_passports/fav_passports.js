"use strict";
// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const favs_service = require("../../services/fav_passports/fav_passports");

// get all favourites from a user id
router.get("/fav-passports/:userId", async (req, res) => {
  try {
    const response = await favs_service.getFavouritesFromUser(
      req.params.userId,
    );
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// delete the user id and passport id from fav_passports
router.delete("/fav-passports/:id", token_service.authenticateToken, async (req, res) => {
  try {
    const response = await favs_service.deleteFromFavourites(
      req.body.userId,
      req.body.passportId,
    );
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// add passport id to fav_passports table when clicking on fav button
router.post("/fav-passports", token_service.authenticateToken, async (req, res) => {
  try {
    const response = await favs_service.addToFavourites(
      req.body.userId,
      req.body.passportId,
    );
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
