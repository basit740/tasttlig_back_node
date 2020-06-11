"use strict";

// Libraries
const userRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const User = require("../../db/queries/tasttlig_auth/user");
const { authenticateToken } = auth;

// GET user by ID
userRouter.get("/tasttlig/user", authenticateToken, async (req, res) => {
  const user = await User.getUserById(req.user.id);
  res.json(user);
});

module.exports = userRouter;
