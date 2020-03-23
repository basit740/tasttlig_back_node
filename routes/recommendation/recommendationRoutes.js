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
      profile_img_url: req.body.profile_img_url,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      description: req.body.description
    };

    try {
      const recommendations = await Recommendation.createRecommendation(
        recommendation,
        req.user.id
      );
      res.json(recommendations);
    } catch (err) {
      res.json(err);
    }
  }
);

// PUT recommendation response from admin
recommendationRouter.put("/recommendation/:id", async (req, res) => {
  const recommendation = {
    reply: req.body.reply
  };

  try {
    const recommendations = await Recommendation.updateRecommendation(
      recommendation,
      req.params.id
    );
    res.json(recommendations);
  } catch (err) {
    console.log("Incoming Recommendation Response", err);
  }
});

// DELETE recommendation response from admin
recommendationRouter.delete("/recommendation/:id", async (req, res) => {
  try {
    const returning = await Recommendation.deleteRecommendation(req.params.id);
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

module.exports = recommendationRouter;
