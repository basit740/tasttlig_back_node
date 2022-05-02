"use strict";

// Libraries
const router = require("express-promise-router")();
const stripe_payment_service = require("../../services/payment/processors/stripe/stripe_payment");
const user_profile_service = require("../../services/profile/user_profile");
const {checkout, charge, completeOrder, cancelOrder} = require("../../services/payment/payment_service");
const {authenticateToken} = require("../../services/authentication/token");

router.post("/payments/cart/checkout",
  authenticateToken,
  async (req, res) => {
    const checkoutResult = await checkout(req.body, req.user)
    return res.send(checkoutResult);
  });

router.post("/payments/cart/charge",
  authenticateToken,
  async (req, res) => {
    const result = await charge(req.body.orderId)
    return res.send(result);
  });

router.post("/payments/cart/complete",
  authenticateToken,
  async (req, res) => {
    const result = await completeOrder(req.body.orderId)
    return res.send(result);
  });

router.post("/payments/cart/cancel",
  authenticateToken,
  async (req, res) => {
    const result = await cancelOrder(req.body.orderId)
    return res.send(result);
  });

// POST stripe bank account
router.post("/add-stripe-ids", async (req, res) => {
  try {
    const db_user = await user_profile_service.getUserById(
      Number(req.body.user_id)
    );
    const response = await stripe_payment_service.createAccountId(
      req.body.bank_account_country,
      req.body.bank_account_currency,
      req.body.bank_account_number,
      req.body.bank_account_routing_number,
      req.body.bank_account_holder_name,
      req.body.bank_account_holder_type,
      req.body.user_id,
      db_user.user.email
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
