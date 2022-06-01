"use strict";

// Libraries
const router = require("express").Router();
const stripe_payment_service = require("../../services/payment/processors/stripe/stripe_payment");
const order_service = require("../../services/order/order_service");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const user_profile_service = require("../../services/profile/user_profile");
const food_sample_claim_service = require("../../services/food_sample_claim/food_sample_claim");
const {authenticateToken} = require("../../services/authentication/token");

router.get("/orders",
  authenticateToken,
  async (req, res) => {
    const result = await order_service.getUserOrders(req.user.id);
    return res.send(result);
  });

router.get(
  "/orders/user/:userId",
  authenticateToken,
  async (req, res) => {
    try {
      const userOrders = await order_service.getUserOrders(req.user.id);
      return res.send(userOrders);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

router.get(
  "/orders/current/user/:userId",
  authenticateToken,
  async (req, res) => {
    try {
      const userOrders = await order_service.getAllCurrentOrders(req.user.id);

      return res.send(userOrders);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
