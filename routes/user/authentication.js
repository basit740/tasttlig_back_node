"use strict";

// Libraries
const authRouter = require("express").Router();
const token_service = require("../../services/authentication/token");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const user_role_manager = require("../../services/profile/user_roles_manager");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");

const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 1000, // start blocking after 10 requests
  message:
    "Too many accounts created from this IP. Please try again after an hour."
});

// POST user register
authRouter.post("/user/register", createAccountLimiter, async (req, res) => {
  if (!req.body.first_name || !req.body.last_name || !req.body.email
    || !req.body.password || !req.body.phone_number){
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try {
    const pw = req.body.password;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(pw, salt);
    const user = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: password,
      phone_number: req.body.phone_number
    };
    const response = await authenticate_user_service.userRegister(user);
    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists."
      });
    }
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message
    });
  }
});

// GET user email address verification for registration
authRouter.get("/user/confirmation/:token", async (req, res) => {
  if (!req.params.token){
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try {
    const user_id = jwt.verify(req.params.token, process.env.EMAIL_SECRET).user;
    const response = await authenticate_user_service.verifyAccount(user_id);
    res.send(response);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message
    });
  }
});

// POST user login
authRouter.post("/user/login", async (req, res) => {
  if (!req.body.passport_id || !req.body.password) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try {
    const response = await authenticate_user_service.getUserLogin(req.body.passport_id);
    if (response.success) {
      const jwtUser = {
        id: response.user.tasttlig_user_id,
        first_name: response.user.first_name,
        last_name: response.user.last_name,
        email: response.user.email,
        passport_id: response.user.passport_id,
        phone_number: response.user.phone_number,
        role: user_role_manager.createRoleObject(response.user.role),
        verified: response.user.is_email_verified
      };
      const isPassCorrect = bcrypt.compareSync(req.body.password, response.user.password);
      const access_token = token_service.generateAccessToken(jwtUser);
      const refresh_token = token_service.generateRefreshToken(jwtUser);
      
      if (!isPassCorrect) {
        return res.status(401).json({
          success: false,
          message: "Invalid password."
        });
      } else {
        try {
          await token_service.storeToken(refresh_token, response.user.tasttlig_user_id);
        } catch (err) {
          res.status(401).send(err);
        }
        
        return res.status(200).json({
          success: true,
          message: "logged",
          user: jwtUser,
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
    return res.status(401).json({
      success: false,
      message: err.message
    });
  }
});

// DELETE user log out
authRouter.delete("/user/logout", token_service.authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id){
      return res.status(403).json({
        success: false,
        message: "Required Parameters are not available in request"
      });
    }
    const returning = await authenticate_user_service.getUserLogOut(req.user.id);
    res.send({
      success: true,
      message: "ok",
      response: returning
    });
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err.message
    });
  }
});

// POST user forgot password
authRouter.post("/user/forgot-password", createAccountLimiter, async (req, res) => {
  if (!req.body.email) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  const returning = await authenticate_user_service.checkEmail(req.body.email);
  res.send(returning);
});

// PUT user enter new password
authRouter.put("/user/update-password/:id", token_service.authForPassUpdate, async (req, res) => {
  if (!req.body.email || !req.body.password){
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  try {
    const email = req.body.email;
    const pw = req.body.password;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(pw, salt);
    if (email) {
      const response = await authenticate_user_service.updatePassword(email, password);
      res.send({
        success: true,
        message: "ok",
        response: response
      });
    }
  } catch (err) {
    if(err.message === "jwt expired"){
      res.send({
        success: false,
        message: "error",
        response: "token is expired"
      });
    } else {
      res.send({
        success: false,
        message: "error",
        response: err.message
      });
    }
  }
  }
);

// POST user forgot password
authRouter.post("/user/create_visitor_account", createAccountLimiter, async (req, res) => {
  if (!req.body.email) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  const returning = await authenticate_user_service.findUserByEmail(req.body.email);
  if(!returning.success) {
    const response = await authenticate_user_service.createDummyUser(req.body.email);
    res.send(response);
  } else {
    res.send(returning);
  }
});

module.exports = authRouter;