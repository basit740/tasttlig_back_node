// Libraries
const indexRouter = require("express").Router();

// GET landing page
indexRouter.get("/", (req, res) => {
  res.render("index");
});

module.exports = indexRouter;
