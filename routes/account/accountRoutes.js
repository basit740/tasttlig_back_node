// Libraries
const cors = require("cors");
const accountRouter = require("express").Router();

// Set up CORS
accountRouter.use(cors());
accountRouter.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// PUT profile update
accountRouter.put("/profile/:id", (req, res) => {
  res.send("PUT Profile Page!");
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

module.exports = accountRouter;
