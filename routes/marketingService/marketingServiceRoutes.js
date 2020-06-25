"use strict";

// Libraries
const marketingServiceRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const MarketingService = require("../../db/queries/marketing_service/marketing_service");
const { authenticateToken } = auth;

// GET all marketing services
marketingServiceRouter.get("/marketing-services", async (req, res) => {
  const marketingServices = await MarketingService.getAllMarketingService();
  res.json(marketingServices);
});

// GET all marketing services based on user ID
marketingServiceRouter.get(
  "/marketing-services/user",
  authenticateToken,
  async (req, res) => {
    const marketingServices = await MarketingService.getUserMarketingService(
      req.user.id
    );
    res.json(marketingServices);
  }
);

// POST marketing service
marketingServiceRouter.post(
  "/marketing-services",
  authenticateToken,
  async (req, res) => {
    const marketingService = {
      category: req.body.category,
      method_of_transportation: req.body.method_of_transportation,
      title: req.body.title,
      body: req.body.body,
      post_img_url: req.body.post_img_url,
      profile_img_url: req.body.profile_img_url,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone_number: req.body.phone_number
    };

    try {
      const marketingServices = await MarketingService.createMarketingService(
        marketingService,
        req.user.id
      );
      res.json(marketingServices);
    } catch (err) {
      res.json(err);
    }
  }
);

module.exports = marketingServiceRouter;
