"use strict";

// Libraries
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cron = require("node-cron");

const Mailer = require("./services/email/nodemailer").nodemailer_transporter;

// Set up dotenv
require("dotenv").config();
require("./db/db-config");

const redoc = require('redoc-express');

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
const fav_passports_router = require("./routes/fav_passports/fav_passports");
const festival_reviews_router = require("./routes/festival_reviews/festival_reviews");
const featured_artists_router = require("./routes/featured_artists/featured_artists");
const neighbourhood_router = require("./routes/neighbourhood/neighbourhood");
const user_subscriptions = require("./routes/user_subcriptions/user_subscriptions");
const twilio = require("./routes/twilio/twilio");

// Set up CORS
const app = express();
let corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.get('/docs/swagger.json', (req, res) => {
  res.sendFile('swagger.json', {root: '.'});
});
app.use(
  '/api-docs',
  redoc({
    title: 'Tasttlig API Docs',
    specUrl: '/docs/swagger.json'
  })
);

// Set up Express
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  if (req.originalUrl === '/payments/webhook') {
    next();
  } else {
    express.json({limit: "50mb"})(req, res, next);
  }
});

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
app.use(subscription_router);

app.use(mobile_router);
app.use(mobile_s3_uploader);
app.use(stripe_account_router);
app.use(email_support_router);
app.use(likes_router);
app.use(follow_interest_router);
app.use(mypassports_router);
app.use(fav_passports_router);
app.use(festival_reviews_router);
app.use(featured_artists_router);
app.use(neighbourhood_router);
app.use(user_subscriptions);

app.use("/hosts", hosts_router);
app.use("/cart", shopping_cart_router);
app.use("/menu_items", menu_items_router);
app.use("/order", order_router);
app.use("/points", points_router);
app.use("/business", business_router);
app.use("/external_api/", external_api_router);
app.use("/nationalities", nationality_router);
app.use("/twilio", twilio);

app.use((err, req, res, next) => {
  console.error({type: 'Error handler', path: (req ? req.originalUrl : null), err, status: err.status});
  res.status(err.status ?? 500).json({success: false, message: err.message});
});

// Cron Job scripts
cron.schedule("0 0 1-31 * *", cron_job_functions.deleteInactiveItems);

const token_service = require("./services/authentication/token");

app.use("/email", token_service.authenticateToken, async (req, res) => {
  const {user} = req;
  await Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: user.email,
    bcc: "ADMIN_EMAIL",
    subject: "[Tasttlig] Welcome to Tasttlig!",
    template: "guest_welcome",
    context: {
      urlVerifyEmail: "[link]",
      first_name: user.first_name,
      last_name: user.last_name,
    },
  });

  return res.status(200).send()
});

// Boot development server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
