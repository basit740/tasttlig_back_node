"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const sponsor_service = require("../../services/sponsor/sponsor");
const user_profile_service = require("../../services/profile/user_profile");

router.get(
  "/sponsor/user/:userId",
  token_service.authenticateToken,
  async (req, res) => {
    const { user_id } = req.body;
    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }

      const response = await sponsor_service.getUserSponsorships(
        req.user.id
      );
      return res.send(response);
    } catch (error) {
      console.log(error);
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);
router.get(
  "/sponsor/inKind/user/:userId",
  token_service.authenticateToken,
  async (req, res) => {
    const { user_id } = req.body;
    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }

      const response = await sponsor_service.getInKindUserSponsorships(
        req.user.id
      );
      return res.send(response);
    } catch (error) {
      console.log(error);
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

module.exports = router;