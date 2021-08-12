"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const ticket_service = require("../../services/ticket/ticket");
const user_profile_service = require("../../services/profile/user_profile");

// GET all tickets
router.get("/ticket/all", token_service.authenticateToken, async (req, res) => {
  try {
    const ticket_user_id = req.query.ticket_user_id || req.user.id;
    const current_page = req.query.page || 1;

    const response = await ticket_service.getAllTickets(
      ticket_user_id,
      current_page
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

// GET vend ticket to a specific festival by a specific user
router.get(
  "/vend-ticket/:user_id/:festival_id",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const response = await ticket_service.getVendTicket(
        req.params.user_id,
        req.params.festival_id
      );

      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

// GET sponsor ticket to a specific festival by a specific user
router.get(
  "/sponsor-ticket/:user_id/:festival_id",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const response = await ticket_service.getSponsorTicket(
        req.params.user_id,
        req.params.festival_id
      );

      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

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

// GET specific ticket details
router.get("/ticket/:ticket_id", async (req, res) => {
  if (!req.params.ticket_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await ticket_service.getTicketDetails(
      req.params.ticket_id
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

// GET specific ticket details
router.get("/ticket/festival/:festival_id", async (req, res) => {
  console.log("req.body from the ticket/festival:", req.params);
  if (!req.params.festival_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await ticket_service.getTicketFestivalDetails(
      req.params.festival_id
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

router.delete("/tickets/delete/user/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await ticket_service.deleteTicketsFromUser(
      req.params.user_id,
      req.body.delete_items
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
    console.log("req.body coming from ticet add:", req.body);
    const {
      ticket_booking_confirmation_id,
      ticket_user_id,
      ticket_festival_id,
      no_of_admits,
      stripe_receipt_id,
      ticket_price,
      ticket_type,
      // attend_status,
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
          ticket_price,
          ticket_type,
        };

        const response = await ticket_service.newTicketInfo(ticket_details);
        console.log("response coming from ticet add:", response);
        return res.send(response);
      } catch (error) {
        res.send({
          success: false,
          message: "Error.",
          response: error,
        });
      }
    } catch (error) {
      console.log("error coming from ticet add:", error);
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

module.exports = router;
