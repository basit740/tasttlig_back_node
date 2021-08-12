"use strict";

// Libraries
const router = require("express").Router();
const user_order_service = require("../../services/payment/user_orders");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const token_service = require("../../services/authentication/token");

// GET user orders
router.get("/user", token_service.authenticateToken, async (req, res) => {
  try {
    const db_user = await authenticate_user_service.findUserByEmail(
      req.user.email
    );

    const db_order_details = await user_order_service.getAllUserOrders(
      db_user.user.tasttlig_user_id
    );

    return res.send(db_order_details);
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// GET user orders
router.get("/user/orders", async (req, res) => {
  console.log("body", req.body);
  try {
    const db_order_details = await user_order_service.getUserOrders(
      req.user.id
    );

    return res.send(db_order_details);
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
