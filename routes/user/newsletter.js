"use strict";

const router = require('express').Router();
const authenticate_user_service = require("../../services/authentication/authenticate_user");

router.post("/tasttlig-newsletters", async (req, res) => {
  if (!req.body.email) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  const returning = await authenticate_user_service.findUserByEmail(req.body.email);
  if(!returning.success) {
    const response = await authenticate_user_service.createDummyUser(req.body.email);
    res.send(response);
  } else {
    res.send(returning);
  }
});

module.exports = router;