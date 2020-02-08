// Libraries
const cors = require("cors");
const indexRouter = require("express").Router();

// Set up CORS
indexRouter.use(cors());
indexRouter.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// GET landing page
indexRouter.get("/", (req, res) => {
  res.render("index");
});

module.exports = indexRouter;
