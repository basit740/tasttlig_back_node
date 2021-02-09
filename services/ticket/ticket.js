"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

// Get tickets in festival helper function
const getTicketDetails = async (ticket_id) => {
  return await db
    .select(
      "ticket_details.*",
      "business_details.business_name",
      "sponsors.sponsor_name",
      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
    )
    .from("ticket_details")
    .leftJoin(
      "festival_images",
      "festivals.festival_id",
      "festival_images.festival_id"
    )
    .leftJoin(
      "business_details",
      "festivals.festival_user_admin_id[0]",
      "business_details.business_details_user_id"
    )
    .leftJoin(
      "sponsors",
      "festivals.festival_business_sponsor_id[0]",
      "sponsors.sponsor_id"
    )
    .groupBy("ticket_details.ticket_id")
    .groupBy("business_details.business_name")
    .groupBy("sponsors.sponsor_name")
    .having("ticket_details.ticket_id", "=", ticket_id)
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// Get ticket list helper function
const getTicketList = async () => {
  return await db
    .select("ticket_details.*")
    .from("ticket_details")
    .where("ticket_details.ticket_id", ">", 3)
    .groupBy("ticket_details.ticket_id")
    .then((value) => {
      return { success: true, ticket_list: value };
    })
    .catch((reason) => {
      return { success: false, data: reason };
    });
};



module.exports = {
 getTicketDetails,
 getTicketList
};
