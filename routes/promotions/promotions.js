"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const services_promotions = require("../../services/promotions/promotions");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const { generateRandomString } = require("../../functions/functions");

//Get promotions from user
router.get("/promotions/user/:user_id", async (req, res) => {
    if (!req.params.user_id) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }
    try {
      console.log(req.query)
      const response = await services_promotions.getPromotionsByUser(
        req.params.user_id,
        req.query.keyword
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

  router.delete("/promotions/delete/user/:user_id", async (req, res) => {
    if (!req.params.user_id) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }
    try {
      const response = await services_promotions.deletePromotionsOfUser(
        req.params.user_id,
        req.body.delete_items
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
