"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const passport_service = require("../../services/passport/businessPassport");

// Insert Passportdetails
// router.post("/business-passport", token_service.authenticateToken, async (req, res) => {
//   console.log("here")
//   try {
//     const response = await passport_service.postBusinessPassportDetails(
//       req.body
//     );
//     return res.send(response);
//   } catch (error) {
//     res.send({
//       success: false,
//       message: "Error.",
//       response: error.message,
//     });
//   }
// });

module.exports = router;
