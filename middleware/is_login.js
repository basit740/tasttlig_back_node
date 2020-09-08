const is_login = (req, res, next) => {
  if (req.user) {
    next()
  } else {
    res.status(401);
  }
}

module.exports = {is_login: is_login}