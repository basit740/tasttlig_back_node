"use strict";

// Libraries
const authRouter = require("express").Router();
const User = require("../../db/queries/auth/user");
const auth = require("./authFunctions");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Refreshtoken = require("../../db/queries/auth/refreshtoken");
const rateLimit = require("express-rate-limit");
const path = require("path");
const Mailer = require("./nodemailer");
const { authenticateToken, authForPassUpdate } = auth;

// const createAccountLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour window
//   max: 1000, // start blocking after 10 requests
//   message:
//     "Too many accounts created from this IP, please try again after an hour"
// });
// const { authenticateToken } = authFunctions;

// POST user register
authRouter.post("/user/register", async (req, res) => {
  try {
    const pw = req.body.password;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(pw, salt);
    const user = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password,
      phone_number: req.body.phone_number,
      user_postal_code: req.body.user_postal_code,
      postal_code_type: req.body.postal_code_type,
      food_handler_certificate: req.body.food_handler_certificate,
      date_of_issue: req.body.date_of_issue,
      expiry_date: req.body.expiry_date,
      commercial_kitchen: req.body.commercial_kitchen
    };
    const response = await User.userRegister(user);
    console.log("User", response);

    if (response.data.constraint == "users_email_unique") {
      res.send({ success: false, message: "This email already exists" });
    }
  } catch (err) {
    console.log("Register", err);
  }
});

// GET user email address verification for registration
authRouter.get("/user/confirmation/:token", async (req, res) => {
  try {
    const user_id = jwt.verify(req.params.token, process.env.EMAIL_SECRET).user;
    const response = await User.verifyAccount(user_id);

    res.send(response);
  } catch (err) {
    res.send(err);
  }
});

// POST user login
authRouter.post("/user/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const response = await User.getUserLogin(email);

    if (response.success && email && password) {
      const { user } = response;
      const jwtUser = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        user_postal_code: user.user_postal_code,
        postal_code_type: user.postal_code_type
      };
      const isPassCorrect = bcrypt.compareSync(password, user.password_digest);
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
            phone_number: user.phone_number,
            user_postal_code: user.user_postal_code,
            postal_code_type: user.postal_code_type
          },
          tokens: {
            access_token,
            refresh_token
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

// DELETE user log out
authRouter.delete("/user/logout", authenticateToken, async (req, res) => {
  try {
    const returning = await User.getUserLogOut(req.user.id);
    res.send({
      success: true,
      message: "ok",
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

authRouter.get("/user/verify/:token", async (req, res) => {
  try {
    const email = jwt.verify(req.params.token, process.env.EMAIL_SECRET).email;
    if (email) {
      res.sendFile("http://localhost:3000/forgotpassword/:token", {
        token: req.params.token
      });
    }
  } catch (err) {
    console.log(err.message);
    err.message === "jwt expired" &&
      res.send({
        success: false,
        message: "error",
        response: "token is expired"
      });
  }
});

authRouter.put("/user/updatepassword", authForPassUpdate, async (req, res) => {
  try {
    const email = req.user.email;
    const pw = req.body.password;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(pw, salt);
    if (email) {
      const response = await User.updatePassword(email, password);
      console.log("updatepassword route:", response);
      res.send({
        success: true,
        message: "ok",
        response: response
      });
    }
  } catch (err) {
    console.log("router error for update password: ", err);
    err.message === "jwt expired" &&
      res.send({
        success: false,
        message: "error",
        response: "token is expired"
      });
  }
});

// PUT user profile update
authRouter.put("/user/:id", async (req, res) => {
  try {
    const pw = req.body.password;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(pw, salt);
    const user = {
      id: req.params.id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password,
      phone_number: req.body.phone_number,
      user_postal_code: req.body.user_postal_code,
      postal_code_type: req.body.postal_code_type,
      food_handler_certificate: req.body.food_handler_certificate,
      date_of_issue: req.body.date_of_issue,
      expiry_date: req.body.expiry_date,
      commercial_kitchen: req.body.commercial_kitchen,
      profile_img_url: req.body.profile_img_url,
      chef: req.body.chef,
      caterer: req.body.caterer,
      business_street_address: req.body.business_street_address,
      business_city: req.body.business_city,
      business_province_territory: req.body.business_province_territory,
      business_postal_code: req.body.business_postal_code,
      facebook: req.body.facebook,
      twitter: req.body.twitter,
      instagram: req.body.instagram,
      youtube: req.body.youtube,
      linkedin: req.body.linkedin,
      website: req.body.website,
      bio: req.body.bio
    };
    const response = await User.updateProfile(user);

    if (response.data.constraint == "users_email_unique") {
      res.send({ success: false, message: "This email already exists" });
    }
  } catch (err) {
    console.log("Update", err);
  }
});

authRouter.post("/user/forgotpassword", async (req, res) => {
  const email = req.body.email;
  const returning = await User.checkEmail(email);
  if (returning.success) {
    jwt.sign(
      { email: email },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "1m" //TODO: Update the time
      },
      async (err, emailToken) => {
        console.log(emailToken);
        try {
          const url = `http://localhost:3000/forgotpassword/${emailToken}`; //TODO: Update with production
          const info = await Mailer.transporter.sendMail({
            to: email,
            subject: "Confirm Email",
            html: `<a href="${url}">Please click here and verify your email address</a>`
          });
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
    res.send({
      success: false,
      message: "ok",
      response: `There is no account for ${email}`
    });
  }
});

authRouter.post("/user/changepassword/:token", (req, res) => {
  console.log(req.params.token);
  console.log(req.body);
});

// authRouter.post("/forgotpassword", createAccountLimiter, (req, res) => {
//   const email = req.body.email;
//   const pw = req.body.password;
//   const saltRounds = 10;
//   const salt = bcrypt.genSaltSync(saltRounds);
//   const password = bcrypt.hashSync(pw, salt);
//   User.forgotPassword(email, password);
// });
authRouter.post("/user/forgotpassword", (req, res) => {});
//Get new access token by using refresh token
authRouter.get("/user/token", async (req, res) => {
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
