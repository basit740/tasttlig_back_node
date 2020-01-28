const authRouter = require("express").Router();
const User = require("../../db/queries/auth/user");
const auth = require("./authFunctions");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Refreshtoken = require("../../db/queries/auth/refreshtoken");
// const { authenticateToken } = authFunctions;

//User login function with email and password, and hash the password

authRouter.get("/confirmation/:token", async (req, res) => {
  try {
    const user_id = jwt.verify(req.params.token, process.env.EMAIL_SECRET).user;
    const response = await User.verifyAccount(user_id);
    console.log("response verification", response);
  } catch (err) {
    console.log("confirmation error: ", err);
  }
});
authRouter.post("/login", async (req, res) => {
  //Authenticate the user
  const email = req.body.email;
  const password = req.body.password;
  try {
    const response = await User.getUserLogin(email);
    if (response.success && email && password) {
      const { user } = response;
      const jwtUser = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        food_handler_certificate: user.food_handler_certificate,
        isHost: user.isHost,
        role: user.role
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
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            verified: user.verified,
            img_url: user.img_url,
            phone_number: user.phone_number,
            food_handler_certificate: user.food_handler_certificate,
            isHost: user.isHost,
            role: user.role
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
    password: password,
    role: req.body.role,
    isHost: req.body.isHost
  };
  User.userRegister(user).then(response => {
    res.send(response);
  });
});

//Get new access token by using refresh token
authRouter.get("/token", async (req, res) => {
  const refreshToken = req.headers["refresh-token"];
  if (refreshToken == null) return res.sendStatus(401);
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, user) => {
      if (err) return res.status(403).send(err);
      const response = await Refreshtoken.checkToken(refreshToken, user.id);
      if (response.success) {
        const access_token = generateAccessToken({
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number,
          food_handler_certificate: user.food_handler_certificate,
          isHost: user.isHost,
          role: user.role
        });
        res.json({ access_token });
      } else {
        return res
          .status(403)
          .send({ success: false, message: "Invalid refresh token" }); //TODO: Update this
      }
    }
  );
});

module.exports = authRouter;
