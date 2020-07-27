"use strict";

const router = require('express').Router();
const token_service = require("../../services/authentication/token");
const user_profile_service = require("../../services/profile/user_profile")

// GET user by ID
router.get("/user", token_service.authenticateToken, async (req, res) => {
  const response = await user_profile_service.getUserById(req.user.id);
  res.json({
    user: {
      id: response.user.tasttlig_user_id,
      first_name: response.user.first_name,
      last_name: response.user.last_name,
      email: response.user.email,
      phone_number: response.user.phone_number,
      role: response.user.role,
      verified: response.user.is_email_verified
    }
  });
});

module.exports = router;
