"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const user_order_service = require("../../services/payment/user_orders");
const subscription_service = require("../../services/subscriptions/subscriptions");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const festival_service = require("../../services/festival/festival");

// GET subscription details
router.get("/subscription/details", async (req, res) => {
  const { item_type, item_id } = req.query;

  if (!item_type || !item_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const order_details = {
      item_id,
      item_type,
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
router.get("/subscription/:userId", async (req, res) => {
  const user_id = req.params.userId;

  try {
    const db_subscription_details =
      await user_profile_service.getVendorUserBySubscriptionId(user_id);

    return res.send(db_subscription_details);
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});
router.post(
  "/subscriptions/addFestival/:userId",
  token_service.authenticateToken,
  async (req, res) => {
    //const user_id = req.params.userId;
    const user_id = req.params.userId;
    const festival_id = req.body.festivalId;
    const user_subscription_id = req.body.user_subscription_id;

    try {
      const db_subscription_details =
        await subscription_service.addFestivalToUserSubscription(
          festival_id,
          user_subscription_id
        );
      const business_details =
        await authentication_service.getUserByBusinessDetails(user_id);
      if (!business_details.success) {
        return res.status(403).json({
          success: false,
          message: business_details.message,
        });
      }

      const response = await festival_service.hostToFestival(
        festival_id,
        business_details.business_details.business_details_id
      );
      if (!response.success) {
        return res.status(403).json({
          success: false,
          message: response.message,
        });
      }

      return res.send(db_subscription_details);
    } catch (error) {
      res.send({
        success: false,
        message: error.message,
      });
    }
  }
);
router.post("/auto-end-subscription", async (req, res) => {
  try {
    if (req.body.userId) {
      const response =
        await subscription_service.autoEndSubscriptions(req.body.userId);
    }
    return res.send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
});

module.exports = router;
