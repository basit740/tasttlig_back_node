// Libraries
const indexRouter = require("express").Router();

// GET landing page
indexRouter.get("/", (req, res) => {
  res.status(200).end();
});

module.exports = indexRouter;
