"use strict";

require("dotenv").config();

const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(keySecret);
const bodyParser = require("body-parser");

const app = express();
// app.use(express.static("public"));

// Create AJAX database environment
const environment = process.env.NODE_ENV || "development";
const configuration = require("./knexfile")[environment];
const database = require("knex")(configuration);

// Set up CORS
app.use(cors());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// GET landing page
app.get("/", (req, res) => {
  res.render("index");
});

// GET create an event page
app.get("/create-event", (req, res) => {
  res.send("GET Create an Event Page!");
});

// GET resources page
app.get("/resources", (req, res) => {
  res.send("GET Resources Page!");
  // database("resources").select()
  //   .then((resources) => {
  //     res.status(200).json(resources);
  //   })
  //   .catch((err) => {
  //     res.status(500).json({ err });
  //   });
});

// GET events page
app.get("/events", (req, res) => {
  res.send("GET Events Page!");
  // database("events").select()
  //   .then((events) => {
  //     res.status(200).json(events);
  //   })
  //   .catch((err) => {
  //     res.status(500).json({ err });
  //   });
});

// POST resource
app.post("/resources", (req, res) => {
  res.send("POST Resource!");
  // database
  //   .insert([
  //     {
  //       user_id: database
  //         .from("users")
  //         .select("id")
  //         .limit(1),
  //       name: req.body.name,
  //       price: req.body.price,
  //       food_ethnicity: req.body.food_ethnicity,
  //       description: req.body.description,
  //       city: req.body.city,
  //       image_url_1: req.body.image_url_1,
  //       image_url_2: req.body.image_url_2,
  //       image_url_3: req.body.image_url_3
  //     }
  //   ])
  //   .into("resources")
  //   .then(res => {
  //     console.log("Response", res);
  //   })
  //   .catch(err => {
  //     console.log("Error", err);
  //   });
});

// POST event
app.post("/events", (req, res) => {
  res.send("POST Event!");
  // database
  //   .insert([
  //     {
  //       user_id: database
  //         .from("users")
  //         .select("id")
  //         .limit(1),
  //       title: req.body.title,
  //       date: req.body.date,
  //       start_time: req.body.start_time,
  //       end_time: req.body.end_time,
  //       event_information: req.body.event_information,
  //       capacity: req.body.capacity,
  //       price: req.body.price,
  //       venue: req.body.venue,
  //       entertainment: req.body.entertainment,
  //       event_type: req.body.event_type,
  //       dress_code: req.body.dress_code,
  //       image_url_1: req.body.image_url_1,
  //       image_url_2: req.body.image_url_2,
  //       image_url_3: req.body.image_url_3
  //     }
  //   ])
  //   .into("events")
  //   .then(res => {
  //     console.log("Response", res);
  //   })
  //   .catch(err => {
  //     console.log("Error", err);
  //   });
});

// POST charge
app.post("/charge", (req, res) => {
  res.send("POST Charge!");
  // database
  //   .insert([
  //     {
  //       user_id: database
  //         .from("users")
  //         .select("id")
  //         .limit(1),
  //       amount: req.body.amount,
  //       receipt_email: req.body.receipt_email,
  //       receipt_url: req.body.token.receipt_url,
  //       fingerprint: req.body.token.fingerprint
  //     }
  //   ])
  //   .into("purchases")
  //   .then(res => {
  //     console.log("Response", res);
  //   })
  //   .catch(err => {
  //     console.log("Error", err);
  //   });

  // stripe.charges
  //   .create({
  //     amount: parseInt(req.body.amount) * 100,
  //     currency: "cad",
  //     description: "Example charge",
  //     source: req.body.token,
  //     receipt_email: req.body.email
  //   })
  //   .then(res => {
  //     console.log("Response", res);
  //   })
  //   .catch(err => {
  //     console.log("Error", err);
  //   });
});

// Boot server
app.listen(3001);
