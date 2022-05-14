"use strict"

const user_subscription_service = require("../../services/user_subscriptions/user_subscriptions");
const {authenticateToken} = require("../../services/authentication/token");
const paymentService = require("../../services/payment/payment_service");

const router = require("express-promise-router")();

router.get("/user_subscriptions",
  authenticateToken,
  async (req, res) => {
    const result = await user_subscription_service
      .getUserSubscriptions(req.user);
    return res.send(result);
  })

router.post("/user_subscriptions",
  authenticateToken,
  async (req, res) => {
    const result = await paymentService.createUserSubscription(req.body.subscriptionCode, req.user);
    return res.send(result);
  })

module.exports = router;