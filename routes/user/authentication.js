"use strict";

// Libraries
const authRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const token_service = require("../../services/authentication/token");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const user_profile_service = require("../../services/profile/user_profile");
const auth_server_service = require("../../services/authentication/auth_server_service");
const { generateRandomString } = require("../../functions/functions");

// Limit the number of accounts created from the same IP address
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 1000, // start blocking after 10 requests
  message:
    "Too many accounts created from this IP. Please try again after an hour.",
});

// POST user register
authRouter.post("/user/register", createAccountLimiter, async (req, res) => {
  const {
    // first_name,
    // last_name,
    email,
    password,
    // phone_number,
    source,
  } = req.body;

  if (!email || !password || !source) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const user = {
      // first_name,
      // last_name,
      email,
      password,
      // phone_number,
      source,
    };

    const response = await authenticate_user_service.userRegister(user);

    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists.",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Email already exists.",
    });
  }
});

// GET user email address verification for registration
authRouter.get("/user/confirmation/:token", async (req, res) => {
  console.log("req.params.token coming from verifying:", req.params.token)
  if (!req.params.token) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const user_id = jwt.verify(req.params.token, process.env.EMAIL_SECRET).user;
    // console.log("token coming from verifying:",req.params.token)
    const response = await authenticate_user_service.verifyAccount(user_id);
    console.log("success, response", response);
    res.send(response);
  } catch (error) {
    console.log("error", error);
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

// POST user login
authRouter.post("/user/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const { success, user } = await auth_server_service.authLogin(
      email,
      password
    );

    if (!success) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    let response = await user_profile_service.getUserByPassportIdOrEmail(email);

    if (!response.success) {
      const new_user = {
        email: user.email,
        passport_id: user.passport_id,
        auth_user_id: user.id,
        created_at_datetime: user.created_at,
        updated_at_datetime: user.updated_at,
        roles: user.roles,
      };

      await authenticate_user_service.userMigrationFromAuthServer(new_user);
    }

    response = await user_profile_service.getUserByPassportIdOrEmail(email);

    const jwtUser = {
      id: response.user.tasttlig_user_id,
      auth_user_id: response.user.auth_user_id,
      first_name: response.user.first_name,
      last_name: response.user.last_name,
      email: response.user.email,
      passport_id: response.user.passport_id,
      phone_number: response.user.phone_number,
      role: response.user.role,
      verified: response.user.is_email_verified,
    };
    const access_token = token_service.generateAccessToken(jwtUser);
    const refresh_token = token_service.generateRefreshToken(jwtUser);

    await token_service.storeToken(
      refresh_token,
      response.user.tasttlig_user_id
    );

    return res.status(200).json({
      success: true,
      message: "Logged in.",
      user: jwtUser,
      tokens: {
        access_token,
        refresh_token,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Email/password combination is invalid.",
    });
  }
});

// DELETE user logout
authRouter.delete(
  "/user/logout",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Required parameters are not available in request.",
        });
      }

      const returning = await authenticate_user_service.getUserLogOut(
        req.user.id
      );

      res.send({
        success: true,
        message: "Logged out.",
        response: returning,
      });
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

// POST user forgot password
authRouter.post(
  "/user/forgot-password",
  createAccountLimiter,
  async (req, res) => {
    if (!req.body.email) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    const returning = await authenticate_user_service.checkEmail(
      req.body.email
    );

    res.send(returning);
  }
);

// PUT user enter new password
authRouter.put("/user/update-password/:token", async (req, res) => {
  if (!req.body.email || !req.body.password || !req.params.token) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const email = req.body.email;
    const password = req.body.password;
    const token = req.params.token;

    if (email) {
      const response = await authenticate_user_service.updatePassword(
        email,
        password,
        token
      );

      res.send({
        success: true,
        message: "Success.",
        response,
      });
    }
  } catch (error) {
    if (error.message === "jwt expired") {
      res.send({
        success: false,
        message: "Error.",
        response: "Token is expired.",
      });
    } else {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
});

// POST visitor account
authRouter.post(
  "/user/create-visitor-account",
  createAccountLimiter,
  async (req, res) => {
    if (!req.body.email) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    const returning = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!returning.success) {
      const response = await authenticate_user_service.createDummyUser(
        req.body.email
      );

      res.send(response);
    } else {
      res.send(returning);
    }
  }
);

// POST new user from multi-step form
authRouter.post(
  "/user/create-new-multi-step-user",
  createAccountLimiter,
  async (req, res) => {
    const {
      first_name,
      last_name,
      email,
      phone_number,
      created_by_admin,
    } = req.body;

    if (!email) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    const become_food_provider_user = {
      first_name,
      last_name,
      email,
      password: generateRandomString(8),
      phone_number,
      created_by_admin,
    };

    const response = await authenticate_user_service.createBecomeFoodProviderUser(
      become_food_provider_user
    );

    res.send(response);
  }
);

// PUT sponsor information from multi-step form
authRouter.put(
  "/user/update-sponsor-info",
  //createAccountLimiter,
  async (req, res) => {
    const db_user = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: "User does not exist.",
      });
    }

    const response = await user_profile_service.saveSponsorForUser(
      req.body,
      db_user.user.tasttlig_user_id
    );

    res.send(response);
  }
);

// PUT business information from multi-step form
authRouter.put(
  "/user/update-business-info",
  createAccountLimiter,
  async (req, res) => {
    const db_user = await authenticate_user_service.findUserByEmail(
      req.body.email
    );
    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: "User does not exist.",
      });
    }
    const response = await user_profile_service.saveBusinessForUser(
      req.body,
      db_user.user.tasttlig_user_id
    );

    res.send(response);
  }
);

// GET user by email
authRouter.get("/user/:user_email", async (req, res) => {
  try {
    const user = await authenticate_user_service.findUserByEmail(
      req.params.user_email
    );

    if (!user.success) {
      res.send({
        success: false,
        message: user.response,
      });
    }

    return res.send({
      success: true,
      message: "",
      response: user,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

module.exports = authRouter;
