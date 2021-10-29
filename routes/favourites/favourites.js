"use strict";
// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const favs_service = require("../../services/favourites/favourites");

// get all favourites from a user id
router.get("/favourites/:userId", async (req, res) => {
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

// count all favourites from a festival id
router.get("/favourites/festival/:festivalId", async (req, res) => {
  try {
    const response = await favs_service.getFavouritesFromFestival(
      req.params.festivalId,
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

// delete the user id and festival id from favourites
router.delete("/favourites/:id", token_service.authenticateToken, async (req, res) => {
  try {
    const response = await favs_service.deleteFromFavourites(
      req.body.userId,
      req.body.festivalId,
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

// add to festival to favourites table when clicking on fav button
router.post("/favourites", token_service.authenticateToken, async (req, res) => {
  try {
    const response = await favs_service.addToLikes(
      req.body.userId,
      req.body.festivalId,
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
