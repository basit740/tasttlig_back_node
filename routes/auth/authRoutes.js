const authRouter = require("express").Router();
const User = require("../../db/queries/user");
const auth = require("./authFunctions");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Refreshtoken = require("../../db/queries/refreshtoken");

const refreshTokens = [];

//User login function with email and password, and hash the password
authRouter.post("/login", async (req, res) => {
  //Authenticate the user
  const email = req.body.email;
  const password = req.body.password;
  try {
    const response = await User.getUserLogin(email);
    if (response.success && email && password) {
      const { user } = response;
      const jwtUser = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        food_handler_certificate: user.food_handler_certificate,
        isHost: user.isHost
      };
      const isPassCorrect = bcrypt.compareSync(password, user.password);
      const access_token = auth.generateAccessToken(jwtUser);
      const refresh_token = auth.generateRefreshToken(jwtUser);
      if (!isPassCorrect) {
        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });
      } else {
        try {
          await Refreshtoken.storeToken(refresh_token, user.id);
        } catch (err) {
          res.status(401).send(err);
        }
        return res.status(200).json({
          success: true,
          message: "logged",
          user: {
            user_id: user.id,
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
    } else {
      res.status(401).send({ success: false, message: response.message });
    }
  } catch (err) {
    return send(err);
  }
});

//User Sign-up Function
authRouter.post("/register", (req, res) => {
  const pw = req.body.password;
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const password = bcrypt.hashSync(pw, salt);
  const user = {
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    phone_number: req.body.phone_number,
    password: password
  };
  User.userRegister(user).then(response => {
    res.send(response);
  });
});

//Get new access token by using refresh token
authRouter.get("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send(err);
    const access_token = generateAccessToken({
      id: user.id,
      name: user.name,
      lastName: user.lastName
    });
    res.json({ access_token });
  });
});

module.exports = authRouter;
