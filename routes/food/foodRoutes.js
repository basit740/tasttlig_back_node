"use strict";

// Libraries
const foodRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Food = require("../../db/queries/food/food");
const { authenticateToken } = auth;

// GET all marketplace food based on user ID
foodRouter.get("/user/food", authenticateToken, async (req, res) => {
  const foods = await Food.getUserFood(req.user.id);
  res.json(foods);
});

// GET all marketplace food
foodRouter.get("/food", async (req, res) => {
  const foods = await food.getAllFood();
  res.send(foods);
});

// POST marketplace food
foodRouter.post("/food", authenticateToken, async (req, res) => {
  const food = {
    img_url_1: req.body.img_url_1,
    name: req.body.name,
    food_ethnicity: req.body.food_ethnicity,
    price: req.body.price,
    quantity: req.body.quantity,
    street_address: req.body.street_address,
    city: req.body.city,
    province_territory: req.body.province_territory,
    postal_code: req.body.postal_code,
    spice_level: req.body.spice_level,
    vegetarian: req.body.vegetarian,
    vegan: req.body.vegan,
    gluten_free: req.body.gluten_free,
    halal: req.body.halal,
    ready_time: req.body.ready_time,
    time_type: req.body.time_type,
    delivery_fee: req.body.delivery_fee,
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
