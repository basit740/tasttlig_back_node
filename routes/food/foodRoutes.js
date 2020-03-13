"use strict";

// Libraries
const foodRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Food = require("../../db/queries/food/food");
const { authenticateToken } = auth;

// GET all marketplace food
foodRouter.get("/food", async (req, res) => {
  const foods = await Food.getAllFood();
  res.json(foods);
});

// GET all marketplace food based on user ID
foodRouter.get("/food/user", authenticateToken, async (req, res) => {
  const foods = await Food.getUserFood(req.user.id);
  res.json(foods);
});

// POST marketplace food
foodRouter.post("/food", authenticateToken, async (req, res) => {
  const food = {
    food_img_url: req.body.food_img_url,
    name: req.body.name,
    food_ethnicity: req.body.food_ethnicity,
    price: req.body.price,
    quantity: req.body.quantity,
    food_street_address: req.body.food_street_address,
    food_city: req.body.food_city,
    food_province_territory: req.body.food_province_territory,
    food_postal_code: req.body.food_postal_code,
    spice_level: req.body.spice_level,
    vegetarian: req.body.vegetarian,
    vegan: req.body.vegan,
    gluten_free: req.body.gluten_free,
    halal: req.body.halal,
    ready_time: req.body.ready_time,
    time_type: req.body.time_type,
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
