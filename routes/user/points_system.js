"use strict";

const router = require('express').Router();
const points_system_service = require("../../services/profile/points_system");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const token_service = require("../../services/authentication/token");

router.get("/user", token_service.authenticateToken, async (req, res) => {
  try{
    const db_user = await authenticate_user_service.findUserByEmail(req.user.email);
    const db_order_details = await points_system_service.getUserPoints(db_user.user.tasttlig_user_id);
    return res.send(db_order_details);
  } catch (err) {
    res.send({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;