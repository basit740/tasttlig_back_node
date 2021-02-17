"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const passport_service = require("../../services/passport/passport");
const user_profile_service = require("../../services/profile/user_profile");

// GET tickets list
router.get("/ticket-list", async (req, res) => {
  try {
    const response = await ticket_service.getTicketList();

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET specific passport details
router.get("/passport/:passport_id", async (req, res) => {
  if (!req.params.passport_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await passport_service.getPassportDetails(
      req.params.passport_id
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// POST to tickets table
router.post(
  "/ticket/add",
  token_service.authenticateToken,
  async (req, res) => {
    const {
      ticket_booking_confirmation_id,
      ticket_user_id,
      ticket_festival_id,
      no_of_admits,
      stripe_receipt_id,
      attend_status,
    } = req.body;
    try {
      if (
        !ticket_booking_confirmation_id ||
        !ticket_user_id ||
        !ticket_festival_id ||
        !no_of_admits ||
        !stripe_receipt_id
      ) {
        return res.status(403).json({
          success: false,
          message: "Required parameters are not available in request.",
        });
      }

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

        const ticket_details = {
          ticket_booking_confirmation_id,
          ticket_user_id,
          ticket_festival_id,
          no_of_admits,
          stripe_receipt_id,
        };
        const response = await ticket_service.newTicketInfo(ticket_details);

        return res.send(response);
      } catch (error) {
        res.send({
          success: false,
          message: "Error.",
          response: error,
        });
      }
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

module.exports = router;
