"use strict";

// Set up dotenv
require("dotenv").config();

// Set up Express
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Set up routes
const indexRouter = require("./routes/index/indexRoutes");
const userRouter = require("./routes/user/userRoutes");
const applicationRouter = require("./routes/application/applicationRoutes");
const foodAdRouter = require("./routes/foodAd/foodAdRoutes");
const experienceRouter = require("./routes/experience/experienceRoutes");
const purchaseRouter = require("./routes/purchase/purchaseRoutes");
const recommendationRouter = require("./routes/recommendation/recommendationRoutes");
const feedbackRouter = require("./routes/feedback/feedbackRoutes");
const postRouter = require("./routes/post/postRoutes");
const commentRouter = require("./routes/comment/commentRoutes");
const flaggedFeedbackRouter = require("./routes/flaggedFeedback/flaggedFeedbackRoutes");
const flaggedForumRouter = require("./routes/flaggedForum/flaggedForumRoutes");
const guestRouter = require("./routes/guest/guestRoutes");
const restaurantRouter = require("./routes/restaurant/restaurantRoutes");
const cookRouter = require("./routes/cook/cookRoutes");
const chefRouter = require("./routes/chef/chefRoutes");
const foodTruckRouter = require("./routes/foodTruck/foodTruckRoutes");
const catererRouter = require("./routes/caterer/catererRoutes");
const menuItemRouter = require("./routes/menuItem/menuItemRoutes");
const searchRouter = require("./routes/search/searchRoutes");
const tasttligMessageRouter = require("./routes/tasttligMessage/tasttligMessageRoutes");

// Configure Express
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
app.options('*', cors())

// Configure routes
app.use(indexRouter);
app.use(userRouter);
app.use(experienceRouter);
app.use(applicationRouter);
app.use(foodAdRouter);
app.use(purchaseRouter);
app.use(recommendationRouter);
app.use(feedbackRouter);
app.use(postRouter);
app.use(commentRouter);
app.use(flaggedFeedbackRouter);
app.use(flaggedForumRouter);
app.use(guestRouter);
app.use(restaurantRouter);
app.use(cookRouter);
app.use(chefRouter);
app.use(foodTruckRouter);
app.use(catererRouter);
app.use(menuItemRouter);
app.use(searchRouter);
app.use(tasttligMessageRouter);

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

// To get all of the API routes
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

// Boot development server
const port = 8000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
