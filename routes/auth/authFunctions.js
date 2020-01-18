const jwt = require("jsonwebtoken");

authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    console.log(req.user);
    next();
  });
};

generateRefreshToken = user => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
};

generateAccessToken = user => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m"
  });
};

const auth = { generateAccessToken, generateRefreshToken, authenticateToken };

module.exports = auth;
