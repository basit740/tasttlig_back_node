const bcrypt = require("bcrypt");

const password_preprocessor = function (req, res, next) {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  req.body.password_digest = bcrypt.hashSync(req.body.password, salt);

  delete req.body.password;
  next();
};

module.exports = password_preprocessor;
