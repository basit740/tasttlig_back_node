"use strict"

const user_subscription_service = require("../../services/user_subscriptions/user_subscriptions");
const {authenticateToken} = require("../../services/authentication/token");

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
    const result = await user_subscription_service
      .createUserSubscription(req.body.subscriptionCode, req.user);
    return res.send(result);
  })

router.delete("/user_subscriptions/:id",
  authenticateToken,
  async (req, res) => {
    const result = await user_subscription_service
      .cancelUserSubscription(req.params.id, req.user.id);
    if (result.success) {
      return res.send(result);
    } else {
      res.status(400).send(result);
    }
  })

module.exports = router;