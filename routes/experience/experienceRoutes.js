"use strict";

const experienceRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Experience = require("../../db/queries/experience/experience");
const { authenticateToken } = auth;

experienceRouter.get(
  "/user/experience",
  authenticateToken,
  async (req, res) => {
    const experiences = await Experience.getUserExperiences(req.user.id);
    res.json(experiences);
  }
);

// experienceRouter.get(
//   "/getallexperiences",
//   authenticateToken,
//   async (req, res) => {
//     if (req.user.role !== "admin") {
//       res
//         .status(403)
//         .send({ success: false, message: "Unauthorized for this path" });
//     } else {
//       const experiences = await Experience.getAllExperiences();
//       console.log(experiences);
//       res.send(experiences);
//     }
//   }
// );
experienceRouter.get("/api/experiences", async (req, res) => {
  const experiences = await Experience.getAllExperiences();
  res.send(experiences);
});

experienceRouter.post(
  "/user/experience",
  authenticateToken,
  async (req, res) => {
    const experience = {
      title: req.body.title,
      food_ethnicity: req.body.food_ethnicity,
      img_url_1: req.body.img_url_1,
      img_url_2: req.body.img_url_2,
      img_url_3: req.body.img_url_3,
      price: req.body.price,
      capacity: req.body.capacity,
      experience_type: req.body.experience_type,
      entertainment: req.body.entertainment,
      dress_code: req.body.dress_code,
      postal_code: req.body.postal_code,
      address_line_1: req.body.address_line_1,
      address_line_2: req.body.address_line_2,
      date: req.body.date,
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      city: req.body.city,
      province: req.body.province,
      experience_information: req.body.experience_information
    };
    try {
      const experiences = await Experience.createExperience(
        experience,
        req.user.id
      );
      res.json(experiences);
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
);

module.exports = experienceRouter;
