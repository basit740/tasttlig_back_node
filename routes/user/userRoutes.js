const userRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const queries = require("../../db/queries");
const { authenticateToken } = auth;

userRouter.get("/user", authenticateToken, async (req, res) => {
  const user = await queries.user.getUserById(req.user.id);
  res.json(user);
});

module.exports = userRouter;
