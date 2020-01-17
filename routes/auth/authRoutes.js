// Libraries
const authRouter = require("express").Router();
const queries = require("../../db/queries");
const auth = require("./authFunctions");

const { authenticateToken } = auth;

const users = [
  { id: 1, name: "Bora", lastName: "Sumer" },
  { id: 2, name: "James", lastName: "Bond" }
];

authRouter.get("/user", authenticateToken, (req, res) => {
  const userById = users.filter(user => {
    return user.id === req.user.id;
  });
  res.json(userById);
});

// router.post('/register',register,(req,res)=>{
// const user ={
//   id:
// }
// })

authRouter.post("/login", authenticateToken, (req, res) => {
  //Authenticate the user
  const name = req.body.name;
  const id = req.body.id;
  const lastName = req.body.lastName;
  const user = {
    id: id,
    name: name,
    lastName: lastName
  };
  const access_token = auth.generateAccessToken(user);
  const refresh_token = auth.generateRefreshToken(user);
  res.json({ access_token, refresh_token });
});

authRouter.get("/user/:id", (req, res) => {
  queries.user.getOne(req.params.id).then(user => {
    res.json(user);
  });
});

module.exports = authRouter;
