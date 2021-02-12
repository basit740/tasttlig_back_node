"use strict";

// Libraries
const router = require("express").Router();
const stripe_payment_service = require("../../services/payment/stripe_payment");
const user_order_service = require("../../services/payment/user_orders");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const user_profile_service = require("../../services/profile/user_profile");
const food_sample_claim_service = require("../../services/food_sample_claim/food_sample_claim");

// POST Stripe payment
router.post("/payment/stripe", async (req, res) => {
  if (!req.body.item_id || !req.body.item_type || !req.body.email) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const order_details = {
      item_id: req.body.item_id,
      item_type: req.body.item_type,
    };

    const db_order_details = await user_order_service.getOrderDetails(
      order_details
    );

    if (!db_order_details.success) {
      return { success: false, message: "Invalid order details." };
    }

    let returning = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!returning.success) {
      returning = await authenticate_user_service.createDummyUser(
        req.body.email
      );
    }

    const response = await stripe_payment_service.paymentIntent(
      db_order_details
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// POST successful Stripe payment
router.post("/payment/stripe/success", async (req, res) => {
  if (
    !req.body.item_id ||
    !req.body.item_type ||
    !req.body.payment_id ||
    !req.body.email
  ) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    let db_user;

    if (req.body.passport_id) {
      db_user = await user_profile_service.getUserByPassportId(
        req.body.passport_id
      );
    } else {
      db_user = await authenticate_user_service.findUserByEmail(req.body.email);
    }

    const order_details = {
      item_id: req.body.item_id,
      item_type: req.body.item_type,
      user_id: db_user.user.tasttlig_user_id,
      user_email: db_user.user.email,
      user_passport_id: db_user.user.passport_id,
      payment_id: req.body.payment_id,
    };

    const db_order_details = await user_order_service.getOrderDetails(
      order_details
    );console.log('db_order_details',db_order_details);

    if (!db_order_details.success) {
      return { success: false, message: "Invalid order details." };
    }

    const response = await user_order_service.createOrder(
      order_details,
      db_order_details
    );console.log('response',response);

    if (req.body.item_type === "food_sample") {
      const food_sample_claim_details = {
        food_sample_claim_email: db_user.user.email,
        food_sample_claim_user_id: db_user.user.tasttlig_user_id,
        food_sample_id: db_order_details.item.food_sample_id,
      };

      const food_claim_response = await food_sample_claim_service.createNewFoodSampleClaim(
        db_user.user,
        db_order_details.item,
        food_sample_claim_details
      );

      return res.send(food_claim_response);
    }

    if (response.success) {
      return res.send({
        success: true,
        details: db_order_details,
      });
    } else {
      return res.send(response);
    }
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// POST Stripe payment in shopping cart
router.post("/payment/stripe/cart", async (req, res) => {
  if (!req.body.cartItems || !req.body.email) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const cartDetails = await user_order_service.getCartOrderDetails(
      req.body.cartItems
    );

    if (!cartDetails.success) {
      return { success: false, message: "Invalid order details." };
    }

    let returning = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!returning.success) {
      returning = await authenticate_user_service.createDummyUser(
        req.body.email
      );
    }

    let db_order_details = {
      item: {
        price: cartDetails.details.price,
        description: "",
      },
    };

    const response = await stripe_payment_service.paymentIntent(
      db_order_details
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// POST successful Stripe payment in shopping cart
router.post("/payment/stripe/cart/success", async (req, res) => {
  if (
    !req.body.cartItems ||
    !req.body.payment_id ||
    (!req.body.email && !req.body.passport_id)
  ) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    let db_user;

    if (req.body.passport_id) {
      db_user = await user_profile_service.getUserByPassportId(
        req.body.passport_id
      );
    } else {
      db_user = await authenticate_user_service.findUserByEmail(req.body.email);
    }

    const order_details = {
      user_id: db_user.user.tasttlig_user_id,
      user_email: db_user.user.email,
      user_passport_id: db_user.user.passport_id,
      payment_id: req.body.payment_id,
      cartItems: req.body.cartItems,
    };

    const db_order_details = await user_order_service.getCartOrderDetails(
      req.body.cartItems
    );

    if (!db_order_details.success) {
      return { success: false, message: "Invalid order details." };
    }

    const response = await user_order_service.createCartOrder(
      order_details,
      db_order_details.details
    );

    if (response.success) {
      return res.send({
        success: true,
        details: db_order_details.details,
      });
    } else {
      return res.send(response);
    }
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
