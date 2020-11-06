"use strict";

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const cron = require('node-cron');

// Set up dotenv
require("dotenv").config();
require("./db/db-config");

const profile_router = require("./routes/user/profile");
const user_authentication_router = require("./routes/user/authentication");
const experience_router = require("./routes/experience/experience");
const food_sample_router = require("./routes/food_sample/food_sample");
const food_sample_claim_router = require("./routes/food_sample_claim/food_sample_claim");
const s3UploaderRouter = require("./routes/helper_routes/s3UploaderRoutes");
const payment_router = require("./routes/payment/payment");
const newsletter_router = require("./routes/user/newsletter");
const admin_user_router = require("./routes/admin/user");
const nationality_router = require("./routes/helper_routes/nationality");
const subscription_router = require("./routes/subscriptions/subscriptions");
const hosts_router = require("./routes/hosts/hosts");
const cron_job_functions = require("./services/cron_job/cron_job_functions")
const shopping_cart_router = require("./routes/shopping_cart/shopping_cart");
const menu_items_router = require("./routes/menu_items/menu_items");
const order_router = require("./routes/user/order");
const points_router = require("./routes/user/points_system");
const business_router = require("./routes/helper_routes/businessFinderRoutes");
const external_api_router = require("./routes/external_api/external_api");

const app = express();
let corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(logger("combined"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(user_authentication_router);
app.use(profile_router);
app.use(experience_router);
app.use(food_sample_router);
app.use(food_sample_claim_router);
app.use(s3UploaderRouter);
app.use(payment_router);
app.use(newsletter_router);
app.use(admin_user_router);
app.use("/nationalities", nationality_router);
app.use(subscription_router);
app.use("/hosts", hosts_router);
app.use("/cart", shopping_cart_router);
app.use("/menu_items", menu_items_router);
app.use("/order", order_router);
app.use("/points", points_router);
app.use("/business", business_router);
app.use("/external_api/", external_api_router);

// Cron Job scripts
cron.schedule('0 0 1-31 * *', cron_job_functions.deleteInactiveItems);

// Boot development server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
