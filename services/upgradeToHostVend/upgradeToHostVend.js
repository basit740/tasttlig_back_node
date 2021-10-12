"use strict";

// Libraries
const {db} = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const festival_service = require("../../services/festival/festival");
const user_profile_service = require("../../services/profile/user_profile");
const _ = require("lodash");

const getUserById = async (id) => {
  return await db
    .select("tasttlig_users.*", db.raw("ARRAY_AGG(roles.role) as role"))
    .from("tasttlig_users")
    .leftJoin(
      "user_role_lookup",
      "tasttlig_users.tasttlig_user_id",
      "user_role_lookup.user_id"
    )
    .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
    .groupBy("tasttlig_users.tasttlig_user_id")
    .having("tasttlig_users.tasttlig_user_id", "=", id)
    .first()
    .then((value) => {
      if (!value) {
        return {success: false, message: "No user found."};
      }

      return {success: true, user: value};
    })
    .catch((error) => {
      return {success: false, message: error};
    });
};

// Get all vendor applications helper function
const getAllVendorApplications = async () => {
  try {
    const applications = await db
      .select("*")
      .from("applications")
      .leftJoin(
        "tasttlig_users",
        "applications.user_id",
        "tasttlig_users.tasttlig_user_id"
      )
      .leftJoin(
        "business_details",
        "applications.user_id",
        "business_details.business_details_user_id"
      )
      .where("applications.type", "=", "vendor")
      .groupBy("applications.application_id")
      .groupBy("tasttlig_users.tasttlig_user_id")
      .groupBy("business_details.business_details_id")
      .having("applications.status", "=", "Pending");

    return {
      success: true,
      applications,
    };
  } catch (error) {
    return {success: false, error: error.message};
  }
};

// get all applications send to specific host using hostId
const getVendorApplications = async (hostId) => {
  try {
    const applications = await db
      .select("*")
      .from("applications")
      .leftJoin(
        "tasttlig_users",
        "applications.user_id",
        "tasttlig_users.tasttlig_user_id"
      )
      .leftJoin(
        "business_details",
        "applications.user_id",
        "business_details.business_details_user_id"
      )
      .leftJoin(
        "festivals",
        "applications.festival_id",
        "festivals.festival_id"
      )
      .where("applications.type", "=", "vendor")
      .groupBy("applications.application_id")
      .groupBy("tasttlig_users.tasttlig_user_id")
      .groupBy("business_details.business_details_id")
      .groupBy("festivals.festival_id")
      .having("applications.status", "=", "Pending")
      .having("applications.receiver_id", "=", Number(hostId));

    return {
      success: true,
      applications,
    };
  } catch (error) {
    return {success: false, error: error.message};
  }
};

const getVendorApplicantDetails = async (userId) => {
  try {
    console.log(userId);
    let application = await db
      .select(
        "business_details.*",
        "business_details_images.*",
        "tasttlig_users.*"
      )
      .from("business_details")
      .leftJoin(
        "tasttlig_users",
        "tasttlig_users.tasttlig_user_id",
        "business_details.business_details_user_id"
      )

      .leftJoin(
        "business_details_images",
        "business_details.business_details_id",
        "business_details_images.business_details_id"
      )

      .leftJoin(
        "user_role_lookup",
        "tasttlig_users.tasttlig_user_id",
        "user_role_lookup.user_id"
      )

      .groupBy("business_details_images.business_details_image_id")
      .groupBy("tasttlig_users.tasttlig_user_id")
      .groupBy("business_details.business_details_id")
      .groupBy("user_role_lookup.user_role_lookup_id")
      .having("tasttlig_users.tasttlig_user_id", "=", Number(userId))
      .first();

    console.log(application);

    return {
      success: true,
      application,
    };
  } catch (error) {
    console.log(error);
    return {success: false, error: error.message};
  }
};

const approveOrDeclineHostVendorApplication = async (
  userId,
  status,
  declineReason,
  Details
) => {
  try {
    console.log("here DB entry");
    //   console.log(preference);
    console.log("DB user", userId);
    console.log(Details);
    const db_user_row = await getUserById(userId);
    //   console.log("got db user")
    const db_user = db_user_row.user;
    //   console.log("user details", db_user);
    let preference = Details.application.business_preference;
    console.log("preferense", preference);
    let role = db_user.role;

    if (!db_user_row.success) {
      return {success: false, message: db_user_row.message};
    }

    // If status is approved
    if (status === "APPROVED") {
      // Update applications table status
      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .andWhere("type", "host")
        .update("status", "APPROVED")
        .returning("*")
        .catch((reason) => {
          return {success: false, message: reason};
        });

      // update the user role as host
      await db("user_role_lookup")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("role_code", "JUCR")
        .update("role_code", "KJ7D")
        .returning("*")
        .catch((reason) => {
          console.log("Reason", reason);
          return {success: false, message: reason};
        });

      // Email the user that their application is approved
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: db_user.email,
        subject: `[Tasttlig] Your request for upgradation to becoming Host is accepted`,
        template: "user_upgrade_approve",
        context: {
          first_name: db_user.first_name,
          last_name: db_user.last_name,
          role_name: "Host",
        },
      });
      console.log("updated application status");

      return {success: true, message: status};
    } else {
      // reject
      // Update applications table status
      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .andWhere("type", "host")
        .update("status", "DECLINED")
        .returning("*")
        .catch((reason) => {
          return {success: false, message: reason};
        });

      // remove in pending status
      await db("user_role_lookup")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("role_code", "JUCR")
        .del()
        .returning("*")
        .catch((reason) => {
          console.log("Reason", reason);
          return {success: false, message: reason};
        });
    }
  } catch (error) {
    return {success: false, message: error};
  }
};

// host approve or decline vendor applicant on a specific festival
const approveOrDeclineVendorApplicationOnFestival = async (
  festivalId,
  ticketPrice,
  userId,
  status,
  declineReason,
  Details
) => {
  try {
    console.log(
      "festivalId from approveOrDeclineVendorApplicationOnFestival: ",
      festivalId
    );
    console.log(
      "ticketPrice from approveOrDeclineVendorApplicationOnFestival: ",
      ticketPrice
    );
    console.log(
      "userId from approveOrDeclineVendorApplicationOnFestival: ",
      userId
    );
    console.log(
      "status from approveOrDeclineVendorApplicationOnFestival: ",
      status
    );
    console.log(
      "declineReason from approveOrDeclineVendorApplicationOnFestival: ",
      declineReason
    );
    console.log(
      "Details from approveOrDeclineVendorApplicationOnFestival: ",
      Details
    );

    const db_user_row = await getUserById(userId);
    const db_user = db_user_row.user;
    let preference = Details.application.business_preference;
    console.log("preferense", preference);
    let role = db_user.role;

    // get the festival info
    const festival = await festival_service.getFestivalDetails(festivalId);
    // get the host info
    const host = await user_profile_service.getUserById(
      festival.details[0].festival_host_admin_id[0]
    );

    // get the client info
    const client = await user_profile_service.getUserById(userId);

    if (!db_user_row.success) {
      return {success: false, message: db_user_row.message};
    }

    // remove vendor from vendor_request_id
    await db("festivals")
      .where("festival_id", festivalId)
      .update({
        vendor_request_id: db.raw("array_remove(vendor_request_id, ?)", [
          db_user.tasttlig_user_id,
        ]),
      })
      .returning("*")
      .catch(() => {
        return {success: false};
      });

    const application = await db("applications")
      .where("user_id", db_user.tasttlig_user_id)
      .andWhere("status", "Pending")
      .andWhere("type", "vendor")
      .andWhere("festival_id", festivalId)
      .returning("*")
      .catch(() => {
        return {success: false};
      });
    // If status is approved
    if (status === "APPROVED") {
      // make sure the there is an application in the database with this applicant on this festival and is Pending
      // add a timer to make sure the application has been created for more than 71 hours to avoid bug after demo June 30
      if (!(application.length === 0)) {
        // update the applications table
        await db("applications")
          .where("user_id", db_user.tasttlig_user_id)
          .andWhere("status", "Pending")
          .andWhere("type", "vendor")
          .andWhere("festival_id", festivalId)
          .update("status", "APPROVED")
          .returning("*")
          .catch((reason) => {
            return {success: false, message: reason};
          });
        // add the user to fesstival
        await db("festivals")
          .where("festival_id", festivalId)
          .update({
            festival_vendor_id: db.raw("array_append(festival_vendor_id, ?)", [
              db_user.tasttlig_user_id,
            ]),
          })
          .returning("*")
          .catch(() => {
            return {success: false};
          });

        // update product pending
        const test = await db("products")
          .leftJoin(
            "business_details",
            "business_details.business_details_id",
            "products.product_business_id"
          )
          .where("business_details_user_id", db_user.tasttlig_user_id)
          .andWhere("festival_selected_pending", "@>", [Number(festivalId)])
          .andWhere("product_offering_type", "@>", ["Vendor"])
          .update({
            festival_selected: db.raw("array_append(festival_selected, ?)", [
              Number(festivalId),
            ]),
          })
          .update({
            festival_selected_pending: db.raw(
              "array_remove(festival_selected_pending, ?)",
              [Number(festivalId)]
            ),
          })
          .returning("*")
          .catch((error) => {
            console.log(error);
          });

        // send notification mail to host
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: host.user.email + "",
          subject: `[Tasttlig] New vendor applicant accpeted`,
          template: "vendor_applicant_timeout_notification",
          context: {
            first_name: host.user.first_name + "",
            last_name: host.user.last_name + "",
            client_first_name: client.user.first_name + "",
            client_last_name: client.user.last_name + "",
            festival_name: festival.details[0].festival_name + "",
          },
        });
        // send notification mail to client
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: client.user.email + "",
          subject: `[Tasttlig] Vendor application accepted`,
          template: "vendor_applicant_accept_notification",
          context: {
            first_name: client.user.first_name + "",
            last_name: client.user.last_name + "",
            host_first_name: host.user.first_name + "",
            host_last_name: host.user.last_name + "",
            festival_name: festival.details[0].festival_name + "",
            host_phone: host.user.phone_number + "",
          },
        });
      }

      console.log("updated application status");

      return {success: true, message: status};
    } else {
      // else DECLINE the application
      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .andWhere("type", "vendor")
        .andWhere("festival_id", festivalId)
        .update("status", "DECLINED")
        .returning("*")
        .catch((reason) => {
          return {success: false, message: reason};
        });
      // add ticketPrice to user credit

      // get the current user credit
      let user = await db("tasttlig_users")
        .where("tasttlig_user_id", userId)
        .returning("*")
        .catch(() => {
          return {success: false};
        });
      // get the sum of tickprice and user credit
      let sum = Number(user[0].credit) + Number(ticketPrice);
      // console.log("credit: ", sum);
      // update the new credit
      await db("tasttlig_users")
        .where("tasttlig_user_id", userId)
        .update("credit", sum)
        .returning("*")
        .catch(() => {
          return {success: false};
        });

      // deletes the corresponding ticket
      await db("ticket_details")
        .where("ticket_user_id", userId)
        .where("ticket_festival_id", festivalId)
        .where("ticket_type", "Vendor")
        .del()
        .returning("*")
        .catch(() => {
          return {success: false};
        });

      // send a mail to clent for rejection
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: client.user.email + "",
        subject: `[Tasttlig] Vendor application rejected`,
        template: "vendor_applicant_reject_notification",
        context: {
          first_name: client.user.first_name + "",
          last_name: client.user.last_name + "",
          host_first_name: host.user.first_name + "",
          host_last_name: host.user.last_name + "",
          festival_name: festival.details[0].festival_name + "",
          host_phone: host.user.phone_number + "",
        },
      });
    }
  } catch (error) {
    return {success: false, message: error};
  }
};

// get all sponsor applications send to specific host using hostId
const getSponsorApplications = async (hostId) => {
  try {
    const applications = await db
      .select("*")
      .from("applications")
      .leftJoin(
        "tasttlig_users",
        "applications.user_id",
        "tasttlig_users.tasttlig_user_id"
      )
      .leftJoin(
        "business_details",
        "applications.user_id",
        "business_details.business_details_user_id"
      )
      .leftJoin(
        "festivals",
        "applications.festival_id",
        "festivals.festival_id"
      )
      .where("applications.type", "=", "sponsor")
      .groupBy("applications.application_id")
      .groupBy("tasttlig_users.tasttlig_user_id")
      .groupBy("business_details.business_details_id")
      .groupBy("festivals.festival_id")
      .having("applications.status", "=", "Pending")
      .having("applications.receiver_id", "=", Number(hostId));

    return {
      success: true,
      applications,
    };
  } catch (error) {
    return {success: false, error: error.message};
  }
};

const getSponsorApplicantDetails = async (userId) => {
  try {
    console.log(userId);
    let application = await db
      .select("tasttlig_users.*")
      .from("tasttlig_users")

      .leftJoin(
        "user_role_lookup",
        "tasttlig_users.tasttlig_user_id",
        "user_role_lookup.user_id"
      )

      .groupBy("tasttlig_users.tasttlig_user_id")
      .groupBy("user_role_lookup.user_role_lookup_id")
      .having("tasttlig_users.tasttlig_user_id", "=", Number(userId))
      .first();

    console.log(application);

    return {
      success: true,
      application,
    };
  } catch (error) {
    console.log(error);
    return {success: false, error: error.message};
  }
};

// host approve or decline sponsor applicant on a specific festival
const approveOrDeclineSponsorApplicationOnFestival = async (
  festivalId,
  ticketPrice,
  userId,
  status,
  declineReason,
  Details
) => {
  try {
    //   console.log(preference);
    console.log(
      "festivalId from approveOrDeclineSponsorApplicationOnFestival: ",
      festivalId
    );
    console.log(
      "ticketPrice from approveOrDeclineSponsorApplicationOnFestival: ",
      ticketPrice
    );
    console.log(
      "userId from approveOrDeclineSponsorApplicationOnFestival: ",
      userId
    );
    console.log(
      "status from approveOrDeclineSponsorApplicationOnFestival: ",
      status
    );
    console.log(
      "declineReason from approveOrDeclineSponsorApplicationOnFestival: ",
      declineReason
    );
    console.log(
      "Details from approveOrDeclineSponsorApplicationOnFestival: ",
      Details
    );

    const db_user_row = await getUserById(userId);
    //   console.log("got db user")
    const db_user = db_user_row.user;
    //   console.log("user details", db_user);
    let preference = Details.application.business_preference;
    console.log("preferense", preference);
    let role = db_user.role;

    // get the festival info
    const festival = await festival_service.getFestivalDetails(festivalId);
    // get the host info
    const host = await user_profile_service.getUserById(
      festival.details[0].festival_host_admin_id[0]
    );

    // get the client info
    const client = await user_profile_service.getUserById(userId);

    if (!db_user_row.success) {
      return {success: false, message: db_user_row.message};
    }

    // remove sponsor from sponsor_request_id
    await db("festivals")
      .where("festival_id", festivalId)
      .update({
        sponsor_request_id: db.raw("array_remove(sponsor_request_id, ?)", [
          db_user.tasttlig_user_id,
        ]),
      })
      .returning("*")
      .catch(() => {
        return {success: false};
      });

    const application = await db("applications")
      .where("user_id", db_user.tasttlig_user_id)
      .andWhere("status", "Pending")
      .andWhere("type", "sponsor")
      .andWhere("festival_id", festivalId)
      .returning("*")
      .catch(() => {
        return {success: false};
      });
    // If status is approved
    if (status === "APPROVED") {
      // make sure the there is an application in the database with this applicant on this festival and is Pending
      // add a timer to make sure the application has been created for more than 71 hours to avoid bug after demo June 30
      if (!(application.length === 0)) {
        // update the applications table
        await db("applications")
          .where("user_id", db_user.tasttlig_user_id)
          .andWhere("status", "Pending")
          .andWhere("type", "sponsor")
          .andWhere("festival_id", festivalId)
          .update("status", "APPROVED")
          .returning("*")
          .catch((reason) => {
            return {success: false, message: reason};
          });

        // update product pending
        await db("products")
          .leftJoin(
            "business_details",
            "business_details.business_details_id",
            "products.product_business_id"
          )
          .where("business_details_user_id", db_user.tasttlig_user_id)
          .andWhere("festival_selected_pending", "@>", [Number(festivalId)])
          .andWhere("product_offering_type", "@>", ["Sponsor"])
          .update({
            festival_selected: db.raw("array_append(festival_selected, ?)", [
              Number(festivalId),
            ]),
          })
          .update({
            festival_selected_pending: db.raw(
              "array_remove(festival_selected_pending, ?)",
              [Number(festivalId)]
            ),
          })
          .returning("*")
          .catch((error) => {
            console.log(error);
          });

        // add the user to fesstival
        await db("festivals")
          .where("festival_id", festivalId)
          .update({
            festival_business_sponsor_id: db.raw(
              "array_append(festival_business_sponsor_id, ?)",
              [db_user.tasttlig_user_id]
            ),
          })
          .returning("*")
          .catch(() => {
            return {success: false};
          });

        // send notification mail to host
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: host.user.email + "",
          subject: `[Tasttlig] New sponsor applicant accpeted`,
          template: "sponsor_applicant_timeout_notification",
          context: {
            first_name: host.user.first_name + "",
            last_name: host.user.last_name + "",
            client_first_name: client.user.first_name + "",
            client_last_name: client.user.last_name + "",
            festival_name: festival.details[0].festival_name + "",
          },
        });
        // send notification mail to client
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: client.user.email + "",
          subject: `[Tasttlig] Sponsor application accepted`,
          template: "sponsor_applicant_accept_notification",
          context: {
            first_name: client.user.first_name + "",
            last_name: client.user.last_name + "",
            host_first_name: host.user.first_name + "",
            host_last_name: host.user.last_name + "",
            festival_name: festival.details[0].festival_name + "",
            host_phone: host.user.phone_number + "",
          },
        });
      }

      console.log("updated application status");

      return {success: true, message: status};
    } else {
      // else DECLINE the application
      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .andWhere("type", "sponsor")
        .andWhere("festival_id", festivalId)
        .update("status", "DECLINED")
        .returning("*")
        .catch((reason) => {
          return {success: false, message: reason};
        });
      // add ticketPrice to user credit

      // get the current user credit
      let user = await db("tasttlig_users")
        .where("tasttlig_user_id", userId)
        .returning("*")
        .catch(() => {
          return {success: false};
        });
      // get the sum of tickprice and user credit
      let sum = Number(user[0].credit) + Number(ticketPrice);
      // console.log("credit: ", sum);
      // update the new credit
      await db("tasttlig_users")
        .where("tasttlig_user_id", userId)
        .update("credit", sum)
        .returning("*")
        .catch(() => {
          return {success: false};
        });

      // deletes the corresponding ticket
      await db("ticket_details")
        .where("ticket_user_id", userId)
        .where("ticket_festival_id", festivalId)
        .where("ticket_type", "sponsor")
        .del()
        .returning("*")
        .catch(() => {
          return {success: false};
        });

      // send a mail to clent for rejection
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: client.user.email + "",
        subject: `[Tasttlig] Sponsor application rejected`,
        template: "sponsor_applicant_reject_notification",
        context: {
          first_name: client.user.first_name + "",
          last_name: client.user.last_name + "",
          host_first_name: host.user.first_name + "",
          host_last_name: host.user.last_name + "",
          festival_name: festival.details[0].festival_name + "",
          host_phone: host.user.phone_number + "",
        },
      });
    }
  } catch (error) {
    return {success: false, message: error};
  }
};

// get all restaurant applications send to specific host using hostId
const getRestaurantApplications = async (hostId) => {
  try {
    const applications = await db
      .select("*")
      .from("applications")
      .leftJoin(
        "tasttlig_users",
        "applications.user_id",
        "tasttlig_users.tasttlig_user_id"
      )
      .leftJoin(
        "business_details",
        "applications.user_id",
        "business_details.business_details_user_id"
      )
      .leftJoin(
        "festivals",
        "applications.festival_id",
        "festivals.festival_id"
      )
      .where("applications.type", "=", "restaurant")
      .groupBy("applications.application_id")
      .groupBy("tasttlig_users.tasttlig_user_id")
      .groupBy("business_details.business_details_id")
      .groupBy("festivals.festival_id")
      .having("applications.status", "=", "Pending")
      .having("applications.receiver_id", "=", Number(hostId));

    return {
      success: true,
      applications,
    };
  } catch (error) {
    return {success: false, error: error.message};
  }
};

const getRestaurantApplicantDetails = async (userId) => {
  try {
    console.log(userId);
    let application = await db
      .select(
        "business_details.*",
        "business_details_images.*",
        "tasttlig_users.*"
      )
      .from("business_details")
      .leftJoin(
        "tasttlig_users",
        "tasttlig_users.tasttlig_user_id",
        "business_details.business_details_user_id"
      )

      .leftJoin(
        "business_details_images",
        "business_details.business_details_id",
        "business_details_images.business_details_id"
      )

      .leftJoin(
        "user_role_lookup",
        "tasttlig_users.tasttlig_user_id",
        "user_role_lookup.user_id"
      )

      .groupBy("business_details_images.business_details_image_id")
      .groupBy("tasttlig_users.tasttlig_user_id")
      .groupBy("business_details.business_details_id")
      .groupBy("user_role_lookup.user_role_lookup_id")
      .having("tasttlig_users.tasttlig_user_id", "=", Number(userId))
      .first();

    console.log(application);

    return {
      success: true,
      application,
    };
  } catch (error) {
    console.log(error);
    return {success: false, error: error.message};
  }
};

// host approve or decline restaurant applicant on a specific festival
const approveOrDeclineRestaurantApplicationOnFestival = async (
  festivalId,
  userId,
  status,
  declineReason,
  Details
) => {
  try {
    //   console.log(preference);
    console.log(
      "festivalId from approveOrDeclineRestaurantApplicationOnFestival: ",
      festivalId
    );
    console.log(
      "userId from approveOrDeclineRestaurantApplicationOnFestival: ",
      userId
    );
    console.log(
      "status from approveOrDeclineRestaurantApplicationOnFestival: ",
      status
    );
    console.log(
      "declineReason from approveOrDeclineRestaurantApplicationOnFestival: ",
      declineReason
    );
    console.log(
      "Details from approveOrDeclineRestaurantApplicationOnFestival: ",
      Details
    );

    const db_user_row = await getUserById(userId);
    //   console.log("got db user")
    const db_user = db_user_row.user;
    //   console.log("user details", db_user);
    let preference = Details.application.business_preference;
    console.log("preferense", preference);
    let role = db_user.role;

    // get the festival info
    const festival = await festival_service.getFestivalDetails(festivalId);
    // get the host info
    const host = await user_profile_service.getUserById(
      festival.details[0].festival_host_admin_id[0]
    );

    // get the client info
    const client = await user_profile_service.getUserById(userId);

    if (!db_user_row.success) {
      return {success: false, message: db_user_row.message};
    }

    const application = await db("applications")
      .where("user_id", db_user.tasttlig_user_id)
      .andWhere("status", "Pending")
      .andWhere("type", "restaurant")
      .andWhere("festival_id", festivalId)
      .returning("*")
      .catch(() => {
        return {success: false};
      });
    // If status is approved
    if (status === "APPROVED") {
      // make sure the there is an application in the database with this applicant on this festival and is Pending
      // add a timer to make sure the application has been created for more than 71 hours to avoid bug after demo June 30
      if (!(application.length === 0)) {
        // update the applications table
        await db("applications")
          .where("user_id", db_user.tasttlig_user_id)
          .andWhere("status", "Pending")
          .andWhere("type", "restaurant")
          .andWhere("festival_id", festivalId)
          .update("status", "APPROVED")
          .returning("*")
          .catch((reason) => {
            return {success: false, message: reason};
          });

        // update restaurant product pending
        await db("products")
          .leftJoin(
            "business_details",
            "business_details.business_details_id",
            "products.product_business_id"
          )
          .where("business_details_user_id", db_user.tasttlig_user_id)
          .andWhere("festival_selected_pending", "@>", [Number(festivalId)])
          .andWhere("product_offering_type", "@>", ["Host"])
          .update({
            festival_selected: db.raw("array_append(festival_selected, ?)", [
              Number(festivalId),
            ]),
          })
          .update({
            festival_selected_pending: db.raw(
              "array_remove(festival_selected_pending, ?)",
              [Number(festivalId)]
            ),
          })
          .returning("*")
          .catch((error) => {
            console.log(error);
          });

        // add the user to fesstival
        await db("festivals")
          .where("festival_id", festivalId)
          .update({
            festival_restaurant_id: db.raw(
              "array_append(festival_restaurant_id, ?)",
              [db_user.tasttlig_user_id]
            ),
          })
          .returning("*")
          .catch(() => {
            return {success: false};
          });

        // send notification mail to host
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: host.user.email + "",
          subject: `[Tasttlig] New restaurant applicant accpeted`,
          template: "restaurant_applicant_timeout_notification",
          context: {
            first_name: host.user.first_name + "",
            last_name: host.user.last_name + "",
            client_first_name: client.user.first_name + "",
            client_last_name: client.user.last_name + "",
            festival_name: festival.details[0].festival_name + "",
          },
        });
        // send notification mail to client
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: client.user.email + "",
          subject: `[Tasttlig] Restaurant application accepted`,
          template: "restaurant_applicant_accept_notification",
          context: {
            first_name: client.user.first_name + "",
            last_name: client.user.last_name + "",
            host_first_name: host.user.first_name + "",
            host_last_name: host.user.last_name + "",
            festival_name: festival.details[0].festival_name + "",
            host_phone: host.user.phone_number + "",
          },
        });
      }

      console.log("updated application status");

      return {success: true, message: status};
    } else {
      // else DECLINE the application
      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .andWhere("type", "restaurant")
        .andWhere("festival_id", festivalId)
        .update("status", "DECLINED")
        .returning("*")
        .catch((reason) => {
          return {success: false, message: reason};
        });

      // get the current user credit
      let user = await db("tasttlig_users")
        .where("tasttlig_user_id", userId)
        .returning("*")
        .catch(() => {
          return {success: false};
        });
      // get the sum of tickprice and user credit
      let sum = Number(user[0].credit) + Number(ticketPrice);
      // console.log("credit: ", sum);
      // update the new credit
      await db("tasttlig_users")
        .where("tasttlig_user_id", userId)
        .update("credit", sum)
        .returning("*")
        .catch(() => {
          return {success: false};
        });

      // send a mail to clent for rejection
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: client.user.email + "",
        subject: `[Tasttlig] Restaurant application rejected`,
        template: "restaurant_applicant_reject_notification",
        context: {
          first_name: client.user.first_name + "",
          last_name: client.user.last_name + "",
          host_first_name: host.user.first_name + "",
          host_last_name: host.user.last_name + "",
          festival_name: festival.details[0].festival_name + "",
          host_phone: host.user.phone_number + "",
        },
      });
    }
  } catch (error) {
    return {success: false, message: error};
  }
};

// add business to festival
const addBusinessToFestival = async (festival_id, user_id) => {
  const userData = await user_profile_service.getUserById(user_id);
  try {
    await db("festivals")
      .where("festival_id", festival_id)
      .update({
        festival_business_id: db.raw("array_append(festival_business_id, ?)", [
          user_id,
        ]),
      })
      .update({
        festival_vendor_id: db.raw("array_append(festival_vendor_id, ?)", [
          user_id,
        ]),
      })
      .update({
        festival_business_sponsor_id: db.raw(
          "array_append(festival_business_sponsor_id, ?)",
          [user_id]
        ),
      })
      .returning("*")
      .catch(() => {
        return {success: false};
      });

    if (userData.user.food_business_type === "Restaurant") {
      await db("festivals")
        .where("festival_id", festival_id)
        .update({
          festival_restaurant_id: db.raw(
            "array_append(festival_restaurant_id, ?)",
            [user_id]
          ),
        })
        .returning("*")
        .catch(() => {
          return {success: false};
        });
    }
  } catch (error) {
    return {success: false, error: error.message};
  }
  return {success: true};
};

const autoApproveVendorFestivalApplications = async () => {
  const pendingLimit = new Date();
  pendingLimit.setHours(pendingLimit.getHours() - 72);

  let query = db.select("festivals.*").from("festivals");
  const fests = await query;
  let vReqs = [];
  vReqs = fests.filter(
    (fst) => fst.vendor_request_id !== null && fst.vendor_request_id.length > 0
  );
  let festByReqUser = [];

  function setFestByReqUser(fest) {
    fest.vendor_request_id !== null &&
    fest.vendor_request_id.length > 0 &&
    fest.vendor_request_id.map((vendor_request_id) => {
      const userId = vendor_request_id;
      delete fest.vendor_request_id;
      festByReqUser.push({userId: userId, ...fest});
    });
  }

  vReqs.length > 0 && vReqs.map(async (fest) => setFestByReqUser(fest));
  festByReqUser.length > 0 &&
  festByReqUser.map(async (fest) => await processApp(fest));

  async function isAppOverdue(userId, festId) {
    let app = null;
    await db("applications")
      .where("user_id", userId)
      .andWhere("status", "Pending")
      .andWhere("festival_id", festId)
      .andWhere("created_at", "<=", pendingLimit)
      .first()
      .then((val) => {
        app = val;
      })
      .catch((error) => {
        console.log("err", error);
        return {success: false};
      });

    if (!app) {
      console.log("No OverDue Vendor Application");
      return false;
    }

    console.log("There's OverDue Vendor Application");
    return true;
  }

  async function processApp(fest) {
    try {
      if ((await isAppOverdue(fest.userId, fest.festival_id)) === false) {
        return;
      }
      const db_user_row = await getUserById(fest.userId);
      const db_user = db_user_row.user;

      // get the festival info
      const festival = await festival_service.getFestivalDetails(
        fest.festival_id
      );
      // get the host info
      const host = await user_profile_service.getUserById(
        fest.festival_host_admin_id[0]
      );

      // get the client info
      const client = await user_profile_service.getUserById(fest.userId);

      if (!db_user_row.success) {
        return {success: false, message: db_user_row.message};
      }

      // update the applications table
      await db("applications")
        .where("user_id", fest.userId)
        .andWhere("status", "Pending")
        .andWhere("type", "vendor")
        .andWhere("festival_id", fest.festival_id)
        .update("status", "APPROVED")
        .returning("*")
        .catch((reason) => {
          return {success: false, message: reason};
        });

      // remove vendor from vendor_request_id
      await db("festivals")
        .where("festival_id", fest.festival_id)
        .update({
          vendor_request_id: db.raw("array_remove(vendor_request_id, ?)", [
            fest.userId,
          ]),
          festival_vendor_id: db.raw("array_append(festival_vendor_id, ?)", [
            fest.userId,
          ]),
        })
        .returning("*")
        .catch(() => {
          return {success: false};
        });

      // update product pending
      const test = await db("products")
        .leftJoin(
          "business_details",
          "business_details.business_details_id",
          "products.product_business_id"
        )
        .where("business_details_user_id", fest.userId)
        .andWhere("festival_selected_pending", "@>", [Number(fest.festival_id)])
        .andWhere("product_offering_type", "@>", ["Vendor"])
        .update({
          festival_selected: db.raw("array_append(festival_selected, ?)", [
            Number(fest.festival_id),
          ]),
        })
        .update({
          festival_selected_pending: db.raw(
            "array_remove(festival_selected_pending, ?)",
            [Number(fest.festival_id)]
          ),
        })
        .returning("*")
        .catch((error) => {
          console.log(error);
        });

      // send notification mail to host
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: host.user.email + "",
        subject: `[Tasttlig] New vendor applicant accpeted`,
        template: "vendor_applicant_timeout_notification",
        context: {
          first_name: host.user.first_name + "",
          last_name: host.user.last_name + "",
          client_first_name: client.user.first_name + "",
          client_last_name: client.user.last_name + "",
          festival_name: festival.details[0].festival_name + "",
        },
      });
      // send notification mail to client
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: client.user.email + "",
        subject: `[Tasttlig] Vendor application accepted`,
        template: "vendor_applicant_accept_notification",
        context: {
          first_name: client.user.first_name + "",
          last_name: client.user.last_name + "",
          host_first_name: host.user.first_name + "",
          host_last_name: host.user.last_name + "",
          festival_name: festival.details[0].festival_name + "",
          host_phone: host.user.phone_number + "",
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
};

const autoApproveSponsorFestivalApplications = async () => {
  const pendingLimit = new Date();
  pendingLimit.setHours(pendingLimit.getHours() - 72);

  let query = db.select("festivals.*").from("festivals");
  const fests = await query;
  let vReqs = [];
  vReqs = fests.filter(
    (fst) =>
      fst.sponsor_request_id !== null && fst.sponsor_request_id.length > 0
  );
  let festByReqUser = [];

  function setFestByReqUser(fest) {
    fest.sponsor_request_id !== null &&
    fest.sponsor_request_id.length > 0 &&
    fest.sponsor_request_id.map((sponsor_request_id) => {
      const userId = sponsor_request_id;
      delete fest.sponsor_request_id;
      festByReqUser.push({userId: userId, ...fest});
    });
  }

  vReqs.length > 0 && vReqs.map(async (fest) => setFestByReqUser(fest));
  festByReqUser.length > 0 &&
  festByReqUser.map(async (fest) => await processApp(fest));

  async function isAppOverdue(userId, festId) {
    let app = null;
    await db("applications")
      .where("user_id", userId)
      .andWhere("status", "Pending")
      .andWhere("festival_id", festId)
      .andWhere("created_at", "<=", pendingLimit)
      .first()
      .then((val) => {
        app = val;
      })
      .catch((error) => {
        console.log("err", error);
        return {success: false};
      });

    if (!app) {
      console.log("No OverDue Sponsor Application");
      return false;
    }

    console.log("There's OverDue Sponsor Application");
    return true;
  }

  async function processApp(fest) {
    try {
      if ((await isAppOverdue(fest.userId, fest.festival_id)) === false) {
        return;
      }
      const db_user_row = await getUserById(fest.userId);
      const db_user = db_user_row.user;

      // get the festival info
      const festival = await festival_service.getFestivalDetails(
        fest.festival_id
      );
      // get the host info
      const host = await user_profile_service.getUserById(
        fest.festival_host_admin_id[0]
      );

      // get the client info
      const client = await user_profile_service.getUserById(fest.userId);

      if (!db_user_row.success) {
        return {success: false, message: db_user_row.message};
      }

      // update the applications table
      await db("applications")
        .where("user_id", fest.userId)
        .andWhere("status", "Pending")
        .andWhere("type", "sponsor")
        .andWhere("festival_id", fest.festival_id)
        .update("status", "APPROVED")
        .returning("*")
        .catch((reason) => {
          return {success: false, message: reason};
        });

      // remove vendor from vendor_request_id
      await db("festivals")
        .where("festival_id", fest.festival_id)
        .update({
          sponsor_request_id: db.raw("array_remove(sponsor_request_id, ?)", [
            fest.userId,
          ]),
          festival_business_sponsor_id: db.raw(
            "array_append(festival_business_sponsor_id, ?)",
            [fest.userId]
          ),
        })
        .returning("*")
        .catch(() => {
          return {success: false};
        });

      // update product pending
      const test = await db("products")
        .leftJoin(
          "business_details",
          "business_details.business_details_id",
          "products.product_business_id"
        )
        .where("business_details_user_id", fest.userId)
        .andWhere("festival_selected_pending", "@>", [Number(fest.festival_id)])
        .andWhere("product_offering_type", "@>", ["Sponsor"])
        .update({
          festival_selected: db.raw("array_append(festival_selected, ?)", [
            Number(fest.festival_id),
          ]),
        })
        .update({
          festival_selected_pending: db.raw(
            "array_remove(festival_selected_pending, ?)",
            [Number(fest.festival_id)]
          ),
        })
        .returning("*")
        .catch((error) => {
          console.log(error);
        });

      // send notification mail to host
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: host.user.email + "",
        subject: `[Tasttlig] New Sponsor applicant accpeted`,
        template: "sponsor_applicant_timeout_notification",
        context: {
          first_name: host.user.first_name + "",
          last_name: host.user.last_name + "",
          client_first_name: client.user.first_name + "",
          client_last_name: client.user.last_name + "",
          festival_name: festival.details[0].festival_name + "",
        },
      });
      // send notification mail to client
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: client.user.email + "",
        subject: `[Tasttlig] Sponsor application accepted`,
        template: "sponsor_applicant_accept_notification",
        context: {
          first_name: client.user.first_name + "",
          last_name: client.user.last_name + "",
          host_first_name: host.user.first_name + "",
          host_last_name: host.user.last_name + "",
          festival_name: festival.details[0].festival_name + "",
          host_phone: host.user.phone_number + "",
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
};
/* (async function runAutoApprove() {
  await autoApproveVendorFestivalApplications();
})(); */

module.exports = {
  getAllVendorApplications,
  getVendorApplications,
  getVendorApplicantDetails,
  approveOrDeclineHostVendorApplication,
  approveOrDeclineVendorApplicationOnFestival,
  getSponsorApplications,
  getSponsorApplicantDetails,
  approveOrDeclineSponsorApplicationOnFestival,
  getRestaurantApplications,
  getRestaurantApplicantDetails,
  approveOrDeclineRestaurantApplicationOnFestival,
  addBusinessToFestival,
  autoApproveVendorFestivalApplications,
  autoApproveSponsorFestivalApplications,
};
