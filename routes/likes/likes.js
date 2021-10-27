"use strict";
// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const likes_service = require("../../services/likes/likes");

// get all likes from a user id
router.get("/likes/:userId", async (req, res) => {
  try {
    const response = await likes_service.getLikesFromUser(
      req.params.userId,
    );
    console.log("response from inside routes likes:", response);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// count all likes from a festival id
router.get("/likes/festival/:festivalId", async (req, res) => {
  try {
    const response = await likes_service.getLikesFromFestival(
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

// delete the user id and festival id from likes
router.delete("/likes/:id", token_service.authenticateToken, async (req, res) => {
  try {
    const response = await likes_service.deleteFromLikes(
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

// add to festival to likes table when clicking on like button
router.post("/likes", token_service.authenticateToken, async (req, res) => {
  try {
    const response = await likes_service.addToLikes(
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
