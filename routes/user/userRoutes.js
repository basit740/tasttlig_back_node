const userRouter = require("express").Router();
const auth = require("../auth/authFunctions");

const { authenticateToken } = auth;

const users = [
  { id: 1, name: "Bora", lastName: "Sumer" },
  { id: 2, name: "James", lastName: "Bond" }
];

userRouter.get("/user", authenticateToken, (req, res) => {
  const userById = users.filter(user => {
    return user.id === req.user.id;
  });
  res.json(userById);
});

module.exports = userRouter;
