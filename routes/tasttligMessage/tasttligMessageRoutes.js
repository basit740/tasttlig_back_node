"use strict";

// Libraries
const tasttligMessageRouter = require("express").Router();
const TasttligMessage = require("../../db/queries/tasttlig_message/tasttlig_message");

// POST Tasttlig Festival message
tasttligMessageRouter.post("/tasttlig-messages", async (req, res) => {
  const tasttligMessage = {
    name: req.body.name,
    email: req.body.email,
    phone_number: req.body.phone,
    message: req.body.text
  };

  try {
    const tasttligMessages = await TasttligMessage.createTasttligMessage(
      tasttligMessage
    );
    res.json(tasttligMessages);
  } catch (err) {
    res.json(err);
  }
});

module.exports = tasttligMessageRouter;
