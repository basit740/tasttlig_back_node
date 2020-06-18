"use strict";

// Libraries
const tasttligFestivalGuestRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const TasttligFestivalGuest = require("../../db/queries/tasttlig_festival_guest/tasttlig_festival_guest");
const { authenticateToken } = auth;

// GET all Tasttlig Festival guests
tasttligFestivalGuestRouter.get(
  "/tasttlig-festival-guests",
  async (req, res) => {
    const tasttligFestivalGuests = await TasttligFestivalGuest.getAllTasttligFestivalGuest();
    res.json(tasttligFestivalGuests);
  }
);

// POST Tasttlig Festival guest
tasttligFestivalGuestRouter.post(
  "/tasttlig-festival-guests",
  authenticateToken,
  async (req, res) => {
    const tasttligFestivalGuest = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone_number: req.body.phone_number
    };

    try {
      const tasttligFestivalGuests = await TasttligFestivalGuest.createTasttligFestivalGuest(
        tasttligFestivalGuest,
        req.user.id
      );
      res.json(tasttligFestivalGuests);
    } catch (err) {
      res.json(err);
    }
  }
);

module.exports = tasttligFestivalGuestRouter;
