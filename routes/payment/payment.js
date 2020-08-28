"use strict";

const router = require('express').Router();
const stripe_payment_service = require("../../services/payment/stripe_payment");
const user_order_service = require("../../services/payment/user_orders");
const token_service = require("../../services/authentication/token");
const authenticate_user_service = require("../../services/authentication/authenticate_user");

router.post("/payment/stripe", async (req, res) => {
  if (!req.body.item_id || !req.body.item_type || !req.body.email) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try{
    const order_details = {
      item_id: req.body.item_id,
      item_type: req.body.item_type
    }
    const db_order_details = await user_order_service.getOrderDetails(order_details);
    if(!db_order_details.success) {
      return {success: false, message: "Invalid Order Details"};
    }
    let returning = await authenticate_user_service.findUserByEmail(req.body.email);
    if(!returning.success) {
      returning = await authenticate_user_service.createDummyUser(req.body.email);
    }
    const response = await stripe_payment_service.paymentIntent(db_order_details);
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: err.message
    });
  }
});

router.post("/payment/stripe/success", async (req, res) => {
  if (!req.body.item_id || !req.body.item_type || !req.body.payment_id
    || !req.body.email) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try{
    let db_user = await authenticate_user_service.findUserByEmail(req.body.email);
    const order_details = {
      item_id: req.body.item_id,
      item_type: req.body.item_type,
      user_id: db_user.tasttlig_user_id,
      user_email: db_user.email,
      payment_id: req.body.payment_id
    }
    const db_order_details = await user_order_service.getOrderDetails(order_details);
    if(!db_order_details.success) {
      return {success: false, message: "Invalid Order Details"};
    }
    const response = await user_order_service.createOrder(order_details, db_order_details);
    if(response.success) {
      return res.send({
        success: true,
        details: db_order_details
      });
    } else {
      return res.send(response);
    }
  } catch (err) {
    res.send({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;