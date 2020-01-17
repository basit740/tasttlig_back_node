// Libraries
const cors = require("cors");
const resourcesRouter = require("express").Router();

// Set up CORS
resourcesRouter.use(cors());
resourcesRouter.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// GET resources page
resourcesRouter.get("/resources", (req, res) => {
  res.send("GET Resources Page!");
  // table("resources").select()
  //   .then((resources) => {
  //     res.status(200).json(resources);
  //   })
  //   .catch((err) => {
  //     res.status(500).json({ err });
  //   });
});

// POST resource
resourcesRouter.post("/resources", (req, res) => {
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

module.exports = resourcesRouter;
