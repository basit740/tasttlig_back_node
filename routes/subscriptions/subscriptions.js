"use strict";

// Libraries
const router = require("express").Router();
const user_order_service = require("../../services/payment/user_orders");

// GET subscription details
router.get("/subscription/details", async (req, res) => {
  if (!req.query.item_type || !req.query.item_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const order_details = {
      item_id: req.query.item_id,
      item_type: req.query.item_type,
    };

    const db_order_details = await user_order_service.getOrderDetails(
      order_details
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
