"use strict";

// Libraries
const tasttligNewsletterRouter = require("express").Router();
const TasttligNewsletter = require("../../db/queries/tasttlig_newsletter/tasttlig_newsletter");

// GET all Tasttlig newsletters
tasttligNewsletterRouter.get("/tasttlig-newsletters", async (req, res) => {
  const tasttligNewsletters = await TasttligNewsletter.getAllTasttligNewsletter();
  res.json(tasttligNewsletters);
});

// POST Tasttlig newsletter
tasttligNewsletterRouter.post("/tasttlig-newsletters", async (req, res) => {
  const tasttligNewsletter = { email: req.body.email };

  try {
    const tasttligNewsletters = await TasttligNewsletter.createTasttligNewsletter(
      tasttligNewsletter
    );
    res.json(tasttligNewsletters);
  } catch (err) {
    res.json(err);
  }
});

module.exports = tasttligNewsletterRouter;
