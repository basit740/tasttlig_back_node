"use strict";

// Libraries
const userRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const User = require("../../db/queries/auth/user");
const { authenticateToken } = auth;

// GET all users
userRouter.get("/users", async (req, res) => {
  const users = await User.getAllUser();
  res.json(users);
});

// GET user by ID
userRouter.get("/user", authenticateToken, async (req, res) => {
  const user = await User.getUserById(req.user.id);
  res.json(user);
});

// PUT accept or reject advertiser applicant from admin
userRouter.put("/users/:id", async (req, res) => {
  const user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    certified: req.body.certified,
    reject_note: req.body.reject_note
  };

  try {
    const users = await User.updateUser(user, req.params.id);
    res.json(users);
  } catch (err) {
    console.log("Update User", err);
  }
});

// PUT message to food advertisers from admin
userRouter.put("/users/message/:id", async (req, res) => {
  const user = {
    emails: req.body.emails,
    subject: req.body.subject,
    message: req.body.message
  };

  try {
    const users = await User.messageFoodAdvertisers(user);
    res.json(users);
  } catch (err) {
    console.log("Message to Food Advertiser", err);
  }
});

module.exports = userRouter;
