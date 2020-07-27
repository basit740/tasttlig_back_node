"use strict";

// Libraries
const db = require("../../db/db-config");
const jwt = require("jsonwebtoken");

const storeToken = async (refresh_token, user_id) => {
  try {
    const response = await db("refresh_tokens")
        .select()
        .where("user_id", user_id);
    if (response.length === 0) {
      try {
        await db("refresh_tokens").insert({
          refresh_token: refresh_token,
          user_id: user_id,
          created_at_datetime: new Date(),
          updated_at_datetime: new Date()
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        await db("refresh_tokens")
            .where("user_id", user_id)
            .update("refresh_token", refresh_token)
            .returning("*");
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    return {success: false, message: err};
  }
}

// Generate access token function
const generateAccessToken = user => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d"
  });
};

// Generate refresh token function
const generateRefreshToken = user => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d"
  });
};

// Authenticate JWT function
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send(err);
    req.user = user;
    next();
  });
};

// Authenticate JWT coming from the client to update the password function
const authForPassUpdate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  jwt.verify(token, process.env.EMAIL_SECRET, (err, user) => {
    if (err) return res.status(403).send(err);
    req.user = user;
    next();
  });
};

const auth = {
  storeToken,
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  authForPassUpdate
};

module.exports = auth;
