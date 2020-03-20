"use strict";

// Libraries
const recommendationRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Recommendation = require("../../db/queries/recommendation/recommendation");
const { authenticateToken } = auth;

// GET all recommendation
recommendationRouter.get("/recommendation", async (req, res) => {
  const recommendations = await Recommendation.getAllRecommendation();
  res.json(recommendations);
});

// GET all recommendation based on user ID
recommendationRouter.get(
  "/recommendation/user",
  authenticateToken,
  async (req, res) => {
    const recommendations = await Recommendation.getUserRecommendation(
      req.user.id
    );
    res.json(recommendations);
  }
);

// POST recommendation
recommendationRouter.post(
  "/recommendation",
  authenticateToken,
  async (req, res) => {
    const recommendation = {
      description: req.body.description
    };

    try {
      const recommendations = await recommendation.createRecommendation(
        recommendation,
        req.user.id
      );
      res.json(recommendations);
    } catch (err) {
      res.json(err);
    }
  }
);

// PUT incoming recommendation response from admin
recommendationRouter.put("/incoming-recommendations", async (req, res) => {
  const recommendation = {
    reply: req.body.reply
  };

  try {
    const recommendations = await recommendation.updateIncomingRecommendation(
      recommendation,
      req.params.id
    );
    res.json(recommendations);
  } catch (err) {
    console.log("Incoming Recommendation Response", err);
  }
});

module.exports = recommendationRouter;
