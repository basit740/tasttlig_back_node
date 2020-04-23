"use strict";

// Libraries
const flaggedFeedbackRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const FlaggedFeedback = require("../../db/queries/flagged_feedback/flagged_feedback");
const { authenticateToken } = auth;

// GET all flagged feedbacks
flaggedFeedbackRouter.get("/flagged-feedbacks", async (req, res) => {
  const flaggedFeedbacks = await FlaggedFeedback.getAllFlaggedFeedback();
  res.json(flaggedFeedbacks);
});

// GET all archived flagged feedbacks
flaggedFeedbackRouter.get("/archived-flagged-feedbacks", async (req, res) => {
  const flaggedFeedbacks = await FlaggedFeedback.getAllArchivedFlaggedFeedback();
  res.json(flaggedFeedbacks);
});

// POST flagged feedback
flaggedFeedbackRouter.post(
  "/flagged-feedbacks",
  authenticateToken,
  async (req, res) => {
    const flaggedFeedback = {
      food_ad_id: req.body.food_ad_id,
      feedback_id: req.body.feedback_id,
      flagged_profile_img_url: req.body.flagged_profile_img_url,
      flagged_first_name: req.body.flagged_first_name,
      flagged_body: req.body.flagged_body,
      feedback_body: req.body.feedback_body,
      feedback_profile_img_url: req.body.feedback_profile_img_url,
      feedback_first_name: req.body.feedback_first_name
    };

    try {
      const flaggedFeedbacks = await FlaggedFeedback.createFlaggedFeedback(
        flaggedFeedback,
        req.user.id
      );
      res.json(flaggedFeedbacks);
    } catch (err) {
      res.json(err);
    }
  }
);

// PUT flagged feedback response from admin
flaggedFeedbackRouter.put("/flagged-feedbacks/:id", async (req, res) => {
  const flaggedFeedback = {
    reply: req.body.reply,
    remove: req.body.remove,
    archive: req.body.archive
  };

  try {
    const flaggedFeedbacks = await FlaggedFeedback.updateFlaggedFeedback(
      flaggedFeedback,
      req.params.id
    );
    res.json(flaggedFeedbacks);
  } catch (err) {
    console.log("Incoming Flagged Feedback Response", err);
  }
});

module.exports = flaggedFeedbackRouter;
