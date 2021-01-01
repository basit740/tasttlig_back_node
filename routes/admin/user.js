"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const user_profile_service = require("../../services/profile/user_profile");
const user_role_manager = require("../../services/profile/user_roles_manager");
const { generateRandomString } = require("../../functions/functions");

// POST user register
router.post(
  "/admin/add-user",
  token_service.authenticateToken,
  async (req, res) => {
    if (!req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    try {
      const adminUserObject = await user_profile_service.getUserById(
        req.user.id
      );

      if (adminUserObject && adminUserObject.success) {
        const adminUser = adminUserObject.user;
        const roles = adminUser.role;

        if (!roles.includes("ADMIN")) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized access.",
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access.",
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    if (!req.body.first_name || !req.body.email) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    try {
      const user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: generateRandomString(8),
        phone_number: req.body.phone_number,
        is_participating_in_festival: req.body.is_participating_in_festival,
      };

      const response = await authenticate_user_service.userRegister(user, true);

      if (response.success) {
        res.status(200).send(response);
      } else {
        return res.status(401).json({
          success: false,
          message: "Email already exists.",
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
