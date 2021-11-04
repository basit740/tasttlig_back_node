"use strict";
// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const follow_interest_service = require("../../services/follow_interest/follow_interest");

// increment interested column in festivals table
router.put("/festivals-interested", async (req, res) => {
  try {
    const response = await follow_interest_service.addToInterested(
      req.body.festivalId
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

// get all follow id from logged in user in user_follows_fest table
router.get("/user-follows-fest/:userId", async (req, res) => {
  try {
    const response = await follow_interest_service.getFollowsFestFromUser(
      req.params.userId,
    );
    console.log("response from inside routes follows_fest:", response);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// delete the user id and festival id from user_follows_fest
router.delete("/user-follows-fest/:id", token_service.authenticateToken, async (req, res) => {
  try {
    const response = await follow_interest_service.deleteFromUserFollowsFest(
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

// add festival to user_follows_fest when clicking on follow button
router.post("/user-follows-fest", token_service.authenticateToken, async (req, res) => {
  try {
    const response = await follow_interest_service.addToUserFollowsFest(
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
