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
    food_ad_id: req.body.food_ad_id,
    body: req.body.body,
    profile_img_url: req.body.profile_img_url,
    feedback_email: req.body.feedback_email,
    feedback_first_name: req.body.feedback_first_name,
    feedback_last_name: req.body.feedback_last_name,
    food_ad_email: req.body.food_ad_email,
    food_ad_first_name: req.body.food_ad_first_name,
    food_ad_last_name: req.body.food_ad_last_name,
    food_ad_name: req.body.food_ad_name
  };

  try {
    const feedbacks = await Feedback.createFeedback(feedback, req.user.id);
    res.json(feedbacks);
  } catch (err) {
    res.json(err);
  }
});

// PUT feedback response from admin
feedbackRouter.put("/feedbacks/:id", async (req, res) => {
  const feedback = {
    remove: req.body.remove
  };

  try {
    const feedbacks = await Feedback.updateFeedback(feedback, req.params.id);
    res.json(feedbacks);
  } catch (err) {
    console.log("Incoming Feedback Response", err);
  }
});

module.exports = feedbackRouter;
