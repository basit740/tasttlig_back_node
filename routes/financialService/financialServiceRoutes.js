"use strict";

// Libraries
const financialServiceRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const FinancialService = require("../../db/queries/financial_service/financial_service");
const { authenticateToken } = auth;

// GET all financial services
financialServiceRouter.get("/financial-services", async (req, res) => {
  const financialServices = await FinancialService.getAllFinancialService();
  res.json(financialServices);
});

// GET all financial services based on user ID
financialServiceRouter.get(
  "/financial-services/user",
  authenticateToken,
  async (req, res) => {
    const financialServices = await FinancialService.getUserFinancialService(
      req.user.id
    );
    res.json(financialServices);
  }
);

// POST financial service
financialServiceRouter.post(
  "/financial-services",
  authenticateToken,
  async (req, res) => {
    const financialService = {
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
      const financialServices = await FinancialService.createFinancialService(
        financialService,
        req.user.id
      );
      res.json(financialServices);
    } catch (err) {
      res.json(err);
    }
  }
);

module.exports = financialServiceRouter;
