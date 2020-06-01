"use strict";
const authRouter = require("express").Router();
const User = require("../../db/queries/tasttlig_auth/user");
const auth = require("./authFunctions");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Refreshtoken = require("../../db/queries/tasttlig_auth/refreshtoken");
const rateLimit = require("express-rate-limit");
const Mailer = require("./nodemailer");
const { authenticateToken, authForPassUpdate } = auth;

/**
 * A module that shouts hello!
 * @name createAccountLimiter middleware to limit the number of the requests
 * @function
 */
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 100, // start blocking after 100 requests
  message:
    "Too many accounts created from this IP, please try again after an hour"
});

/**
 * @name get/tasttlig/user/confirmation/:token
 * @async
 * @function
 * @param {String} "/tasttlig/user/confirmation/:token" path
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @returns {void}
 */
authRouter.get("/tasttlig/user/confirmation/:token", async (req, res) => {
  try {
    const user_id = jwt.verify(req.params.token, process.env.EMAIL_SECRET).user; //TODO UPDATE
    const response = await User.verifyAccount(user_id);
    console.log("response verification", response);
    res.status(200).send(response);
  } catch (err) {
    console.log("confirmation error: ", err);
    res.status(403).send(err);
  }
});

/**
 * @name delete/tasttlig/user/logout
 * @async
 * @function
 * @param {String} "/tasttlig/user/logout" path
 * @param {Function} authenticateToken  middleware for authenticate the token.
 * @param {Object} req  The request.
 * @param {Object} res  The response.
 * @returns {Void}
 */
authRouter.delete("/tasttlig/user/logout", authenticateToken, async (req, res) => {
  try {
    const returning = await User.getUserLogOut(req.user.id);
    res.send({
      success: true,
      message: "error",
      response: returning
    });
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err
    });
  }
});

// authRouter.get("/tasttlig/user/verify/:token", async (req, res) => {
//   console.log(req.params.token);
//   try {
//     const email = jwt.verify(req.params.token, process.env.EMAIL_SECRET).email;
//     if (email) {

//     }
//   } catch (err) {
//     console.log(err.message);
//     err.message === "jwt expired" &&
//       res.send({
//         success: false,
//         message: "error",
//         response: "token is expired"
//       });
//   }
// });

/**
 * @name put/tasttlig/user/updatepassword
 * @async
 * @function
 * @param {String} "user/updatepassword" path
 * @param {Function} authForPassUpdate  middleware for authenticate the token coming from the verification email.
 * @param {Object} req  The request.
 * @param {Object} res  The response.
 * @returns {Void}
 */
authRouter.put("/tasttlig/user/updatepassword", authForPassUpdate, async (req, res) => {
  console.log(req.body);
  try {
    const email = req.user.email;
    const pw = req.body.password;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(pw, salt);
    if (email) {
      const response = await User.updatePassword(email, password);
      console.log("updatepassword route:", response);
    }
  } catch (err) {
    console.log("router error for update password: ", err.message);
    err.message === "jwt expired" &&
      res.send({
        success: false,
        message: "error",
        response: "token is expired"
      });
  }
});

/**
 * @name post/tasttlig/user/forgotpassword
 * @async
 * @function
 * @param {String} "user/forgotpassword" path
 * @param {Object} req  The request.
 * @param {Object} res  The response.
 * @returns {Void}
 */
authRouter.post("/tasttlig/user/forgotpassword", async (req, res) => {
  const email = req.body.email;
  const returning = await User.checkEmail(email);
  if (returning.success) {
    jwt.sign(
      { email: email },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "20m" //TODO: Update the time
      },
      async (err, emailToken) => {
        console.log(emailToken);
        try {
          const url = `http://localhost:3000/forgotpassword/${emailToken}`;
          const info = await Mailer.transporter.sendMail({
            to: email,
            subject: "Confirm Email",
            html: `<a href="${url}">Please click here and verify your email address</a>`
          });
          console.log(info);
          if (info.accepted[0] === email) {
            res.send({
              success: true,
              message: "ok",
              response: `Your verification email has been sent to ${email}`
            });
          }
        } catch (err) {
          console.log("mail err", err);
        }
      }
    );
  } else {
    res.status(404).send({
      success: false,
      error: `There is no account for ${email}`
    });
  }
});

//TODO Update
/**
 * @name post/tasttlig/user/changepassword/:token
 * @function
 * @param {String} "user/changepassword/:token" path
 * @param {Object} req  The request.
 * @param {Object} res  The response.
 * @returns {Void}
 */
authRouter.post("/tasttlig/user/changepassword/:token", (req, res) => {
  console.log(req.params.token);
  console.log(req.body);
});

/**
 * @name post/tasttlig/user/login
 * @async
 * @function
 * @param {String} "user/login" path
 * @param {Object} req  The request.
 * @param {Object} res  The response.
 * @returns {Void}
 */
authRouter.post("/tasttlig/user/login", async (req, res) => {
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
      console.log("Hi", password);
      const isPassCorrect = bcrypt.compareSync(password, user.password);
      const access_token = auth.generateAccessToken(jwtUser);
      const refresh_token = auth.generateRefreshToken(jwtUser);
      console.log("Hi", jwtUser);
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
    console.log("Hi", err);
    return send(err);
  }
});

/** 
 * @name post/tasttlig/user/register
 * @async
 * @function
 * @param {String} "user/changepassword/:token" path
 * @param {Function} createAccountLimiter middleware function to limit the number of the requests
 * @param {Object} req  The request.
 * @param {Object} res  The response.
 * @returns {Void}
 */
authRouter.post("/tasttlig/user/register", createAccountLimiter, async (req, res) => {
  try {
    console.log(req.body);
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
      // role: req.body.role,
      // isHost: req.body.isHost
    };
    const response = await User.userRegister(user); //TODO: DEBUG THIS OBJECT
    console.log(user);
    if (response.success) {
      res.status(200).send(response);
    } else {
      res.status(403).send(response);
    }
  } catch (err) {
    res.status(403).send(err);
  }
});

// authRouter.post("/forgotpassword", createAccountLimiter, (req, res) => {
//   const email = req.body.email;
//   const pw = req.body.password;
//   const saltRounds = 10;
//   const salt = bcrypt.genSaltSync(saltRounds);
//   const password = bcrypt.hashSync(pw, salt);
//   User.forgotPassword(email, password);
// });
// authRouter.post("/tasttlig/user/forgotpassword", createAccountLimiter, (req, res) => {});
//Get new access token by using refresh token

/**
 * @name post/tasttlig/user/token
 * @async
 * @function
 * @param {String} "user/token" path
 * @param {Object} req  The request.
 * @param {Object} res  The response.
 * @returns {Void}
 */
authRouter.get("/tasttlig/user/token", async (req, res) => {
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

/**
 * A module that exports the authRouter
 * @module authRouter
 */
module.exports = authRouter;
