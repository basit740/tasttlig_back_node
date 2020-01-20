"use strict";

require("dotenv").config();

const indexRouter = require("./routes/index/indexRoutes");
const userRouter = require("./routes/user/userRoutes");
const resourcesRouter = require("./routes/resources/resourcesRoutes");
const eventsRouter = require("./routes/events/eventsRoutes");
const stripeRouter = require("./routes/stripe/stripeRoutes");
const accountRouter = require("./routes/account/accountRoutes");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(indexRouter);
app.use(userRouter);
app.use(resourcesRouter);
app.use(eventsRouter);
app.use(stripeRouter);
app.use(accountRouter);

// app.use(express.static("public"));

const port = 8000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
