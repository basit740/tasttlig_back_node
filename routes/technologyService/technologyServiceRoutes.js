"use strict";

// Libraries
const technologyServiceRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const TechnologyService = require("../../db/queries/technology_service/technology_service");
const { authenticateToken } = auth;

// GET all technology services
technologyServiceRouter.get("/technology-services", async (req, res) => {
  const technologyServices = await TechnologyService.getAllTechnologyService();
  res.json(technologyServices);
});

// GET all technology services based on user ID
technologyServiceRouter.get(
  "/technology-services/user",
  authenticateToken,
  async (req, res) => {
    const technologyServices = await TechnologyService.getUserTechnologyService(
      req.user.id
    );
    res.json(technologyServices);
  }
);

// POST technology service
technologyServiceRouter.post(
  "/technology-services",
  authenticateToken,
  async (req, res) => {
    const technologyService = {
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
      const technologyServices = await TechnologyService.createTechnologyService(
        technologyService,
        req.user.id
      );
      res.json(technologyServices);
    } catch (err) {
      res.json(err);
    }
  }
);

module.exports = technologyServiceRouter;
