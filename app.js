"use strict";

// Libraries
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const cron = require("node-cron");

// Set up dotenv
require("dotenv").config();
require("./db/db-config");

// Routes
const profile_router = require("./routes/user/profile");
const user_authentication_router = require("./routes/user/authentication");
const experience_router = require("./routes/experience/experience");
const products_router = require("./routes/products/products");
const services_router = require("./routes/services/services");
const promotions_router = require("./routes/promotions/promotions");
const upgrade_router = require("./routes/upgradeToHostVend/upgradeToHostVend");
const orders_router = require("./routes/order/order");
const experiences_router = require("./routes/experiences/experiences");
const food_sample_router = require("./routes/food_sample/food_sample");
const all_product_router = require("./routes/allProducts/all_product");
const reviews_router = require("./routes/reviews/reviews");
const festival_router = require("./routes/festival/festival");
const vendor_router = require("./routes/vendor/vendor");
const sponsor_router = require("./routes/sponsor/sponsor");
const ticket_router = require("./routes/ticket/ticket");
const passport_router = require("./routes/passport/passport");
const food_sample_claim_router = require("./routes/food_sample_claim/food_sample_claim");
const s3UploaderRouter = require("./routes/helper_routes/s3UploaderRoutes");
const payment_router = require("./routes/payment/payment");
const newsletter_router = require("./routes/user/newsletter");
const admin_user_router = require("./routes/admin/user");
const nationality_router = require("./routes/helper_routes/nationality");
const subscription_router = require("./routes/subscriptions/subscriptions");
const hosts_router = require("./routes/hosts/hosts");
const cron_job_functions = require("./services/cron_job/cron_job_functions");
const shopping_cart_router = require("./routes/shopping_cart/shopping_cart");
const menu_items_router = require("./routes/menu_items/menu_items");
const order_router = require("./routes/user/order");
const points_router = require("./routes/user/points_system");
const business_router = require("./routes/helper_routes/businessFinderRoutes");
const external_api_router = require("./routes/external_api/external_api");
const mobile_router = require("./mobile/routes/routes");
const mobile_s3_uploader = require("./mobile/routes/mobileS3UploaderRoutes");
const stripe_account_router = require("./routes/stripe_accounts/stripe_accounts");
const email_support_router = require("./routes/helper_routes/emailSupport");
const likes_router = require("./routes/likes/likes");
const follow_interest_router = require("./routes/follow_interest/follow_interest");
const mypassports_router = require("./routes/mypassports/mypassports");

// Set up CORS
const app = express();
let corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Set up Express
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "50mb" }));
app.use(logger("combined"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Use routes
app.use(user_authentication_router);
app.use(profile_router);
app.use(experience_router);
app.use(products_router);
app.use(promotions_router);
app.use(upgrade_router);
app.use(services_router);
app.use(orders_router);
app.use(experiences_router);
app.use(food_sample_router);
app.use(all_product_router);
app.use(reviews_router);
app.use(food_sample_claim_router);
app.use(s3UploaderRouter);
app.use(payment_router);
app.use(newsletter_router);
app.use(admin_user_router);
app.use(festival_router);
app.use(vendor_router);
app.use(sponsor_router);
app.use(ticket_router);
app.use(passport_router);
app.use("/nationalities", nationality_router);
app.use(subscription_router);
app.use("/hosts", hosts_router);
app.use("/cart", shopping_cart_router);
app.use("/menu_items", menu_items_router);
app.use("/order", order_router);
app.use("/points", points_router);
app.use("/business", business_router);
app.use("/external_api/", external_api_router);
app.use(mobile_router);
app.use(mobile_s3_uploader);
app.use(stripe_account_router);
app.use(email_support_router);
app.use(likes_router);
app.use(follow_interest_router);
app.use(mypassports_router);

// Cron Job scripts
cron.schedule("0 0 1-31 * *", cron_job_functions.deleteInactiveItems);

// Boot development server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
