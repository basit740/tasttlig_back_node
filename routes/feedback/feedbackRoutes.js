"use strict";

// Libraries
const feedbackRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Feedback = require("../../db/queries/feedback/feedback");
const { authenticateToken } = auth;

// GET all feedbacks
feedbackRouter.get("/feedbacks", async (req, res) => {
  const feedbacks = await Feedback.getAllFeedback();
  res.json(feedbacks);
});

// POST feedback
feedbackRouter.post("/feedbacks", authenticateToken, async (req, res) => {
  const feedback = {
    food_ad_number: req.body.food_ad_number,
    body: req.body.body
  };

  try {
    const feedbacks = await Feedback.createFeedback(feedback, req.user.id);
    res.json(feedbacks);
  } catch (err) {
    res.json(err);
  }
});

// DELETE feedback response from admin
feedbackRouter.delete("/feedbacks/:id", async (req, res) => {
  try {
    const returning = await Feedback.deleteFeedback(req.params.id);
    res.send({
      success: true,
      message: "ok",
      response: returning
    });
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err
    });
  }
});

module.exports = feedbackRouter;
