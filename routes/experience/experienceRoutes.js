"use strict";

// Libraries
const experienceRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Experience = require("../../db/queries/experience/experience");
const { authenticateToken } = auth;

// GET all experiences
experienceRouter.get("/experiences", async (req, res) => {
  const experiences = await Experience.getAllExperiences();
  res.send(experiences);
});

// GET all experiences based on host ID
experienceRouter.get(
  "/experiences/user",
  authenticateToken,
  async (req, res) => {
    const experiences = await Experience.getUserExperiences(req.user.id);
    res.json(experiences);
  }
);

// POST experience from host
experienceRouter.post("/experiences", authenticateToken, async (req, res) => {
  const experience = {
    img_url_1: req.body.img_url_1,
    // img_url_2: req.body.img_url_2,
    // img_url_3: req.body.img_url_3,
    title: req.body.title,
    price: req.body.price,
    category: req.body.category,
    style: req.body.style,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    capacity: req.body.capacity,
    dress_code: req.body.dress_code,
    address_line_1: req.body.address_line_1,
    address_line_2: req.body.address_line_2,
    city: req.body.city,
    province_territory: req.body.province_territory,
    postal_code: req.body.postal_code,
    description: req.body.description,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    phone_number: req.body.phone_number
  };
  try {
    const experiences = await Experience.createExperience(
      experience,
      req.user.id
    );
    res.json(experiences);
  } catch (err) {
    res.json(err);
  }
});

// PUT accept or reject experience from admin
experienceRouter.put("/experiences/:id", async (req, res) => {
  const experience = {
    title: req.body.title,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    accepted: req.body.accepted,
    reject_note: req.body.reject_note
  };

  try {
    const experiences = await Experience.updateExperience(
      experience,
      req.params.id
    );
    res.json(experiences);
  } catch (err) {
    console.log("Update Experience", err);
  }
});

// DELETE experience from admin
experienceRouter.delete("/experiences/:id", async (req, res) => {
  try {
    const returning = await Experience.deleteExperience(req.params.id);
    res.send({
      success: true,
      message: "ok",
      response: returning
    });
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err
    });
  }
});

module.exports = experienceRouter;
