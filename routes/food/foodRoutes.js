"use strict";

// Libraries
const foodRouter = require("express").Router();
const cors = require("cors");
const auth = require("../auth/authFunctions");
const Food = require("../../db/queries/marketplace/food");
const { authenticateToken } = auth;

// Set up CORS
foodRouter.use(cors());
foodRouter.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// GET marketplace food based on user ID
foodRouter.get("/getuserfoods", authenticateToken, async (req, res) => {
  const foods = await Food.getUserFood(req.user.id);
  res.json(foods);
});

// GET all marketplace food for admin
foodRouter.get("/getallfoods", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    res
      .status(403)
      .send({ success: false, message: "Unauthorized for this path" });
  } else {
    const foods = await Food.getAllFood();
    res.send(foods);
  }
});

// POST marketplace food
foodRouter.post("/addfood", authenticateToken, async (req, res) => {
  const food = {
    name: req.body.name,
    food_ethnicity: req.body.food_ethnicity,
    img_url_1: req.body.img_url_1,
    img_url_2: req.body.img_url_2,
    img_url_3: req.body.img_url_3,
    price: req.body.price,
    postal_code: req.body.postal_code,
    address_line_1: req.body.address_line_1,
    address_line_2: req.body.address_line_2,
    city: req.body.city,
    province: req.body.province,
    description: req.body.description
  };
  try {
    const foods = await Food.createFood(food, req.user.id);
    res.json(foods);
  } catch (err) {
    res.json(err);
  }
});

module.exports = foodRouter;
