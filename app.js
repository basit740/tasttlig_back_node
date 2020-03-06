"use strict";

require("dotenv").config();

const indexRouter = require("./routes/index/indexRoutes");
const userRouter = require("./routes/user/userRoutes");
const foodRouter = require("./routes/food/foodRoutes");
const stripeRouter = require("./routes/stripe/stripeRoutes");
const searchRouter = require("./routes/search/searchRoutes");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(indexRouter);
app.use(userRouter);
app.use(foodRouter);
app.use(stripeRouter);
app.use(searchRouter);

function print(path, layer) {
  if (layer.route) {
    layer.route.stack.forEach(
      print.bind(null, path.concat(split(layer.route.path)))
    );
  } else if (layer.name === "router" && layer.handle.stack) {
    layer.handle.stack.forEach(
      print.bind(null, path.concat(split(layer.regexp)))
    );
  } else if (layer.method) {
    console.log(
      "%s /%s",
      layer.method.toUpperCase(),
      path
        .concat(split(layer.regexp))
        .filter(Boolean)
        .join("/")
    );
  }
}

//to get the all api routes
function split(thing) {
  if (typeof thing === "string") {
    return thing.split("/");
  } else if (thing.fast_slash) {
    return "";
  } else {
    var match = thing
      .toString()
      .replace("\\/?", "")
      .replace("(?=\\/|$)", "$")
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
    return match
      ? match[1].replace(/\\(.)/g, "$1").split("/")
      : "<complex:" + thing.toString() + ">";
  }
}

// app._router.stack.forEach(print.bind(null, [])); //TODO: uncomment to see the api routes

// app.use(express.static("public"));

const port = 8000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
