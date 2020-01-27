"use strict";

// Libraries
const restaurantRouter = require("express").Router();
const cors = require("cors");
const auth = require("../auth/authFunctions");
const Restaurant = require("../../db/queries/profile/restaurant");
const { authenticateToken } = auth;

// Set up CORS
restaurantRouter.use(cors());
restaurantRouter.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// GET restaurant by ID
restaurantRouter.post("/restaurant", authenticateToken, async (req, res) => {
  const restaurant = {
    email: req.body.email,
    postal_code: req.body.postal_code,
    address_line_1: req.body.address_line_1,
    address_line_2: req.body.address_line_2,
    city: req.body.city,
    province: req.body.province,
    description: req.body.description,
    phone_number: req.body.phone_number,
    img_url: req.body.img_url,
    isValidated: req.body.isValidated
  };
  const response = await Restaurant.createPurchase(restaurant, req.user.id);
  res.json(response);
});

module.exports = restaurantRouter;
