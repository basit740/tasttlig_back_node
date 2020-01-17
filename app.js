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

// Create AJAX table environment
const environment = process.env.NODE_ENV || "development";
const configuration = require("./knexfile")[environment];
const table = require("knex")(configuration);

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
  // table("resources").select()
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
  // table("events").select()
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
  // table
  //   .insert([
  //     {
  //       user_id: table
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
  // table
  //   .insert([
  //     {
  //       user_id: table
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
  // table
  //   .insert([
  //     {
  //       user_id: table
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

// PUT profile update
app.put("/profile/:id", (req, res) => {
  // const first_name = req.body.first_name;
  // const last_name = req.body.last_name;
  // const email = req.body.email;
  // const password = req.body.password;
  // const hashedPassword = bcrypt.hashSync(password, 10);
  // // Check for profile update errors
  // if (!first_name || !last_name || !email || !password) {
  //   res.status(400).send("Invalid entry. Please try again.");
  //   return;
  // } else {
  // /* Check if email already exists in users table.
  // If so, send error message.
  // If not, update information in users table. */
  //   table
  //     .select("email")
  //     .from("users")
  //     .where("email", email)
  //     .then(emailList => {
  //       if (emailList.length !== 0) {
  //         res.status(400).send("Email already exists. Please try again.");
  //         return;
  //       } else {
  //         table("users")
  //           .where({
  //             email
  //           })
  //           .update({
  //             first_name,
  //             last_name,
  //             email,
  //             password: hashedPassword
  //           })
  //           .finally(() => {
  //             table.destroy;
  //           })
  //           .then(res => {
  //             console.log("Response", res);
  //           })
  //           .catch(err => {
  //             console.log("Error", err);
  //           });
  //       }
  //     });
  // }
});

// DELETE logout
app.delete("/logout", (req, res) => {});

// Boot server
app.listen(3001);
