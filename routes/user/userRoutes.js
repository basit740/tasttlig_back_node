const userRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const User = require("../../db/queries/auth/user");
const { authenticateToken } = auth;

userRouter.get("/user", authenticateToken, async (req, res) => {
  const user = await User.getUserById(req.user.id);
  res.json(user);
});

module.exports = userRouter;
