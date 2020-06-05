"use strict";

// Libraries
const userRouter = require("express").Router();
const cors = require("cors");
const auth = require("../auth/authFunctions");
const User = require("../../db/queries/tasttlig_auth/user");
const { authenticateToken } = auth;

// Set up CORS
userRouter.use(cors());
userRouter.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// GET user by ID
userRouter.get("/tasttlig/user", authenticateToken, async (req, res) => {
  const user = await User.getUserById(req.user.id);
  res.json(user);
});

module.exports = userRouter;
