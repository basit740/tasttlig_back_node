const authRouter = require("express").Router();
const queries = require("../../db/queries");
const auth = require("./authFunctions");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { authenticateToken } = auth;

// Create AJAX database environment
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../knexfile")[environment];
const db = require("knex")(configuration);

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

const refreshTokens = [];

authRouter.post("/login", async (req, res, next) => {
  //Authenticate the user
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await queries.user.getUser(email);
    const isPassCorrect = await bcrypt.compareSync(password, user.password);
    const access_token = auth.generateAccessToken(user);
    const refresh_token = auth.generateRefreshToken(user);
    if (!isPassCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "logged",
        user: {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          img_url: user.img_url,
          phone_number: user.phone_number,
          food_handler_certificate: user.food_handler_certificate,
          isHost: user.isHost
        },
        tokens: {
          access_token: access_token,
          refresh_token: refresh_token
        }
      });
    }
  } catch (err) {
    return next(err);
  }
});

authRouter.post("/register", (req, res) => {
  const email = req.body.email;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const phone_number = req.body.phone_number;
  const pw = req.body.password;
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const password = bcrypt.hashSync(pw, salt);
  db("users")
    .insert({ email, password, first_name, last_name, phone_number })
    .then(result => {
      res.json({ success: true, message: "ok", result: result });
    });
});

authRouter.get("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const access_token = generateAccessToken({
      id: user.id,
      name: user.name,
      lastName: user.lastName
    });
    res.json({ access_token });
  });
});

module.exports = authRouter;
