// Libraries
const cors = require("cors");
const eventsRouter = require("express").Router();

// Set up CORS
eventsRouter.use(cors());
eventsRouter.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// GET create an event page
eventsRouter.get("/create-event", (req, res) => {
  res.send("GET Create an Event Page!");
});

// GET events page
eventsRouter.get("/events", (req, res) => {
  res.send("GET Events Page!");
  // table("events").select()
  //   .then((events) => {
  //     res.status(200).json(events);
  //   })
  //   .catch((err) => {
  //     res.status(500).json({ err });
  //   });
});

// POST event
eventsRouter.post("/events", (req, res) => {
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

module.exports = eventsRouter;
