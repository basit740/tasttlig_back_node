"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;

// Get passport in festival helper function
const getPassportDetails = async (userId, currentPage) => {
  const userIdInt = Number(userId);
  let query = db
    .select(
      "tasttlig_users.*",
      "ticket_details.*",
      "festivals.festival_id",
      "festivals.festival_name",
      "festivals.festival_city",
      "festivals.festival_price",
      "festivals.festival_start_date",
      "festivals.festival_end_date"
    )
    .from("tasttlig_users")
    .leftJoin(
      "ticket_details",
      "tasttlig_users.tasttlig_user_id",
      "ticket_details.ticket_user_id"
    )
    .leftJoin(
      "festivals",
      "ticket_details.ticket_festival_id",
      "festivals.festival_id"
    )
    .where("tasttlig_users.tasttlig_user_id", "=", userIdInt)
    .groupBy("tasttlig_users.tasttlig_user_id")
    .groupBy("tasttlig_users.passport_id")
    .groupBy("ticket_details.ticket_id")
    .groupBy("festivals.festival_id")
    .orderBy("festivals.festival_end_date", "asc");

  query = query.paginate({
    perPage: 12,
    isLengthAware: true,
    currentPage: currentPage,
  });

  return await query
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log(reason);
      return { success: false, details: reason };
    });
};

module.exports = {
  getPassportDetails,
};
