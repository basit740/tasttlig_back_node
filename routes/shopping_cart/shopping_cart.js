"use strict";

const router = require('express').Router();
const token_service = require("../../services/authentication/token");
const shopping_cart_service = require("../../services/shopping_cart/shopping_cart");
const user_profile_service = require("../../services/profile/user_profile");
const user_role_manager = require("../../services/profile/user_roles_manager");

router.get("/", token_service.authenticateToken(), async (req, res) => {
  try {
    const response = await shopping_cart_service.getCart(req.user.id);
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err.message
    });
  }
});

router.post("/add", token_service.authenticateToken(), async (req, res) => {
  if(!req.body.item_id || !req.body.item_type || !req.body.quantity){
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try {
    let cart = await shopping_cart_service.getCart(req.user.id);
    if (!cart.success){
      cart = await shopping_cart_service.createCart(req.user.id);
    }
    const response = await shopping_cart_service.addCartItem(
      cart[0].cart_id,
      req.body.item_type,
      req.body.item_id,
      req.body.quantity
    );
    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err.message
    });
  }
});

router.put("/update", token_service.authenticateToken, async (req, res) => {

});

module.exports = router;