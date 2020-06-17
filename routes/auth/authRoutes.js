"use strict";

// Libraries
const authRouter = require("express").Router();
const User = require("../../db/queries/auth/user");
const auth = require("./authFunctions");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Refreshtoken = require("../../db/queries/auth/refreshtoken");
// const rateLimit = require("express-rate-limit");
// const path = require("path");
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
      tasttlig: req.body.tasttlig
    };
    const response = await User.userRegister(user);

    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists."
      });
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
        phone_number: user.phone_number
      };
      const isPassCorrect = bcrypt.compareSync(password, user.password_digest);
      const access_token = auth.generateAccessToken(jwtUser);
      const refresh_token = auth.generateRefreshToken(jwtUser);

      if (!isPassCorrect) {
        return res.status(401).json({
          success: false,
          message: "Invalid password."
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
            phone_number: user.phone_number
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

// PUT user profile update to become a publisher
authRouter.put("/user/become-publisher/:id", async (req, res) => {
  try {
    const user = {
      id: req.params.id,
      food_handler_certificate: req.body.food_handler_certificate,
      date_of_issue: req.body.date_of_issue,
      expiry_date: req.body.expiry_date,
      certified: req.body.certified
    };

    const response = await User.updateProfile(user);

    if (response.data.constraint == "users_email_unique") {
      res.send({ success: false, message: "This email already exists" });
    }
  } catch (err) {
    console.log("Update", err);
  }
});

// PUT user profile update on you
authRouter.put("/user/you/:id", async (req, res) => {
  try {
    const pw = req.body.password;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(pw, salt);
    const user = {
      id: req.params.id,
      profile_img_url: req.body.profile_img_url,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password,
      phone_number: req.body.phone_number,
      bio: req.body.bio
    };

    const response = await User.updateProfile(user);

    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists."
      });
    }
  } catch (err) {
    console.log("Update", err);
  }
});

// PUT user profile update on location
authRouter.put("/user/location/:id", async (req, res) => {
  try {
    const user = {
      id: req.params.id,
      business_street_address: req.body.business_street_address,
      business_city: req.body.business_city,
      business_province_territory: req.body.business_province_territory,
      business_postal_code: req.body.business_postal_code,
      facebook: req.body.facebook,
      twitter: req.body.twitter,
      instagram: req.body.instagram,
      youtube: req.body.youtube,
      linkedin: req.body.linkedin,
      website: req.body.website
    };

    await User.updateProfile(user);
  } catch (err) {
    console.log("Update", err);
  }
});

// POST user forgot password
authRouter.post("/user/forgot-password", async (req, res) => {
  const email = req.body.email;
  const tasttlig = req.body.tasttlig;
  const returning = await User.checkEmail(email);
  if (returning.success && tasttlig) {
    jwt.sign(
      { email },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "15m"
      },
      // Async reset password email
      async (err, emailToken) => {
        try {
          const url = `http://localhost:3000/forgot-password/${emailToken}/${email}`;
          const info = await Mailer.transporter.sendMail({
            to: email,
            bcc: process.env.TASTTLIG_ADMIN_EMAIL,
            subject: "[Tasttlig] Reset your password",
            html:  `<div>Hello,<br><br></div>
                    <div>
                      There was a request to reset your password. If so, please click on the link below. If not, disregard this email.<br><br>
                    </div>
                    <div>
                      <a href="${url}">Reset Your Password</a><br><br>
                    </div>
                    <div>Sincerely,<br><br></div>
                    <div>Tasttlig Team<br><br></div>
                    <div>Tasttlig Corporation</div>
                    <div>585 Dundas St E, 3rd Floor</div>
                    <div>Toronto, ON M5A 2B7, Canada</div>`
          });
          if (info.accepted[0] === email) {
            res.send({
              success: true,
              message: "ok",
              response: `Your update password email has been sent to ${email}.`
            });
          }
        } catch (err) {
          console.log(err);
        }
      }
    );
  } else if (returning.success) {
    jwt.sign(
      { email },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "15m"
      },
      // Async reset password email
      async (err, emailToken) => {
        try {
          const url = `http://localhost:3000/forgot-password/${emailToken}/${email}`;
          const info = await Mailer.transporter.sendMail({
            to: email,
            bcc: process.env.KODEDE_ADMIN_EMAIL,
            subject: "[Kodede] Reset your password",
            html:  `<div>Hello,<br><br></div>
                    <div>
                      There was a request to reset your password. If so, please click on the link below. If not, disregard this email.<br><br>
                    </div>
                    <div>
                      <a href="${url}">Reset Your Password</a><br><br>
                    </div>
                    <div>
                      Sent with <3 from Kodede (Created By Tasttlig).<br><br>
                    </div>
                    <div>Tasttlig Corporation</div>
                    <div>585 Dundas St E, 3rd Floor</div>
                    <div>Toronto, ON M5A 2B7, Canada</div>`
          });
          if (info.accepted[0] === email) {
            res.send({
              success: true,
              message: "ok",
              response: `Your update password email has been sent to ${email}.`
            });
          }
        } catch (err) {
          console.log(err);
        }
      }
    );
  } else {
    res.send({
      success: false,
      message: "ok",
      response: `There is no account for ${email}.`
    });
  }
});

// PUT user enter new password
authRouter.put(
  "/user/update-password/:id",
  authForPassUpdate,
  async (req, res) => {
    try {
      const email = req.body.email;
      const pw = req.body.password;
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const password = bcrypt.hashSync(pw, salt);
      const tasttlig = req.body.tasttlig;
      if (email) {
        const response = await User.updatePassword(email, password, tasttlig);
        res.send({
          success: true,
          message: "ok",
          response: response
        });
      }
    } catch (err) {
      console.log(err);
      err.message === "jwt expired" &&
        res.send({
          success: false,
          message: "error",
          response: "token is expired"
        });
    }
  }
);

// Get new access token by using refresh token
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
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone_number: user.phone_number
        });
        res.json({ access_token });
      } else {
        return res
          .status(403)
          .send({ success: false, message: "Invalid refresh token." });
      }
    }
  );
});

module.exports = authRouter;
