// Libraries
const jwt = require("jsonwebtoken");

// Authenticate token function
authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Generate refresh token function
generateRefreshToken = user => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
};

// Generate access token function
generateAccessToken = user => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15s"
  });
};

const auth = { generateAccessToken, generateRefreshToken, authenticateToken };

module.exports = auth;
