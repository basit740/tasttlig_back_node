"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;

// Get all festivals helper function
const getAllTickets = async (userId, currentPage) => {
  // let startDate = filters.startDate.substring(0, 10);
  // let startTime = formatTime(filters.startTime);
  const userIdInt = Number(userId);
  let query = db
    .select(
      "ticket_details.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      "tasttlig_users.email",
      "tasttlig_users.phone_number",
      "festivals.festival_price",
      "festivals.festival_vendor_price",
      "festivals.festival_name",
      "festivals.festival_city",
      "festivals.festival_type",
      "festivals.festival_description",
      "festivals.festival_start_time",
      "festivals.festival_end_time",
      "festivals.festival_start_date",
      "festivals.festival_end_date",
      "festivals.festival_id",

      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
    )
    .from("ticket_details")
    .leftJoin(
      "festivals",
      "ticket_details.ticket_festival_id",
      "festivals.festival_id"
    )
    .leftJoin(
      "tasttlig_users",
      "ticket_details.ticket_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .leftJoin(
      "festival_images",
      "ticket_details.ticket_festival_id",
      "festival_images.festival_id"
    )
    .where("ticket_details.ticket_user_id", "=", userIdInt)
    .groupBy("ticket_details.ticket_id")
    .groupBy("tasttlig_users.phone_number")
    .groupBy("tasttlig_users.email")
    .groupBy("tasttlig_users.first_name")
    .groupBy("tasttlig_users.last_name")
    .groupBy("festivals.festival_price")
    .groupBy("festivals.festival_vendor_price")
    .groupBy("festivals.festival_name")
    .groupBy("festivals.festival_city")
    .groupBy("festivals.festival_type")
    .groupBy("festivals.festival_description")
    .groupBy("festivals.festival_end_time")
    .groupBy("festivals.festival_start_time")
    .groupBy("festivals.festival_end_date")
    .groupBy("festivals.festival_start_date")
    .groupBy("festivals.festival_id")
    .groupBy("festivals.festival_type")
    .orderBy("festivals.festival_start_date", "asc");
    
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
      return { success: false, details: reason };
    });
};

// Get tickets in festival helper function
const getTicketDetails = async (ticket_id) => {
  return await db
    .select(
      "ticket_details.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      "tasttlig_users.email",
      "tasttlig_users.phone_number",
      "festivals.festival_name",
      "festivals.festival_city",
      "festivals.festival_description",
      "festivals.festival_start_time",
      "festivals.festival_end_time",
      "festivals.festival_start_date",
      "festivals.festival_end_date",
      "festivals.festival_price",
      "festivals.festival_type",
      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
    )
    .from("ticket_details")
    .leftJoin(
      "tasttlig_users",
      "ticket_details.ticket_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .leftJoin(
      "festivals",
      "ticket_details.ticket_festival_id",
      "festivals.festival_id"
    )
    .leftJoin(
      "festival_images",
      "ticket_details.ticket_festival_id",
      "festival_images.festival_id"
    )
    .groupBy("ticket_details.ticket_id")
    .groupBy("tasttlig_users.tasttlig_user_id")
    .groupBy("festivals.festival_id")
    .groupBy("festivals.festival_type")
    .having("ticket_details.ticket_id", "=", ticket_id)
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};


// Get tickets in festival helper function
const getTicketFestivalDetails = async (festival_id) => {
  return await db
    .select(
      "ticket_details.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      "tasttlig_users.email",
      "tasttlig_users.phone_number",
      "festivals.festival_name",
      "festivals.festival_city",
      "festivals.festival_description",
      "festivals.festival_start_time",
      "festivals.festival_end_time",
      "festivals.festival_start_date",
      "festivals.festival_end_date",
      "festivals.festival_price",
      "festivals.festival_type",
      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
    )
    .from("ticket_details")
    .leftJoin(
      "tasttlig_users",
      "ticket_details.ticket_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .leftJoin(
      "festivals",
      "ticket_details.ticket_festival_id",
      "festivals.festival_id"
    )
    .leftJoin(
      "festival_images",
      "ticket_details.ticket_festival_id",
      "festival_images.festival_id"
    )
    .groupBy("ticket_details.ticket_id")
    .groupBy("tasttlig_users.tasttlig_user_id")
    .groupBy("festivals.festival_id")
    .groupBy("festivals.festival_type")
    .having("ticket_details.ticket_festival_id", "=", festival_id)
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

const newTicketInfo = async (ticket_details) => {
  console.log("ticket_details coming from ticet add:", ticket_details.ticket_festival_id[0])
  try {
    if(typeof ticket_details.ticket_festival_id === "object") {
      await db.transaction(async (trx) => {
        const vendorFestival = ticket_details.ticket_festival_id.map((festivalNumber) => ({
          // ticket_booking_confirmation_id: ticket_details.ticket_booking_confirmation_id,
          ticket_user_id: ticket_details.ticket_user_id,
          ticket_festival_id: festivalNumber,
          no_of_admits: ticket_details.no_of_admits,
          ticket_price: ticket_details.ticket_price,
          ticket_type: ticket_details.ticket_type,
          stripe_receipt_id: ticket_details.stripe_receipt_id,

        }))
        const db_ticket = await trx("ticket_details")
          .insert(vendorFestival)
          .returning("*");
  
        if (!db_ticket) {
          return { success: false, details: "Inserting new ticket failed." };
        }
      });
    } else {
      await db.transaction(async (trx) => {
        const db_ticket = await trx("ticket_details")
          .insert(ticket_details)
          .returning("*");
  
        if (!db_ticket) {
          return { success: false, details: "Inserting new ticket failed." };
        }
      });

    }

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

const deleteTicketsFromUser = async(user_id, delete_items) => {
  try {
    for (let item of delete_items) {
      await db.transaction(async(trx) => {
        const ticketDelete = await trx("ticket_details")
        .where({
          ticket_id: item.ticket_id,
        })
        .del()
        .then(() => {
          return { success: true };
        })
        .catch((reason) => {
          return { success: false, details: reason };
        });
      })
    }
  } catch(error) {
    return { success: false, details: error}
  }
}

module.exports = {
  getAllTickets,
  getTicketDetails,
  getTicketList,
  newTicketInfo,
  deleteTicketsFromUser,
  getTicketFestivalDetails
};
