"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer =
  require("../../services/email/nodemailer").nodemailer_transporter;
const jwt = require("jsonwebtoken");


const getUserSponsorships = async(user_id) => {
  return await db
  .select(
    "festivals.*",
    "user_subscriptions.subscription_code"
  )
  .from("festivals")
  .leftJoin(
    "user_subscriptions",
    "festivals.festival_business_sponsor_id[1]",
    "user_subscriptions.user_id"
  )
  .groupBy("festivals.*")
  .groupBy("user_subscriptions.subscription_code")
  .groupBy("festivals.festival_business_sponsor_id")
  .groupBy("festivals.festival_id")
  .groupBy("user_subscriptions.user_id")
  .where("user_subscriptions.user_id", "=", user_id)
  .andWhere(function() {
    this.where("user_subscriptions.subscription_code", "S_C1")
    .orWhere("user_subscriptions.subscription_code", "S_C2")
    .orWhere("user_subscriptions.subscription_code", "S_C3")
  })
  //.having("user_subscriptions.subscription_code", "S_C1")
  //.orWhere("user_subscriptions.subscription_code", "S_C2")
  //.orWhere("user_subscriptions.subscription_code", "S_C3")
  .then((value) => {
    console.log(value);
    return {success: true, details: value};
  })
  .catch((reason) => {
    console.log(reason);
    return {success: false, details: reason};
  })
  
}
const getInKindUserSponsorships = async(user_id) => {
  return await db
  .select(
    "festivals.*",
    "products.title"
  )
  .from("festivals")
  .leftJoin(
    "products",
    "festivals.festival_id",
    "products.festival_selected[1]"
  )
  .groupBy("festivals.*")
  .groupBy("products.product_user_id")
  .groupBy("festivals.festival_business_sponsor_id")
  .groupBy("products.title")
  .groupBy("products.product_type")
  .groupBy("products.festival_selected[1]")
  .groupBy("festivals.festival_id")
  .having("products.product_user_id", "=", Number(user_id))
  .andHaving("products.product_type", "=", "SPONSOR")
  .then((value) => {
    console.log(value);
    return {success: true, details: value};
  })
  .catch((reason) => {
    console.log(reason);
    return {success: false, details: reason};
  })
  
}

 // Get all applications helper function
 const getAllSponsorApplications = async () => {
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
      // .leftJoin(
      //   "user_subscriptions",
      //   "tasttlig_users.tasttlig_user_id",
      //   "user_subscriptions.user_id"
      // )
      .where("applications.type", "=", "sponsor")
      .groupBy("applications.application_id")
      .groupBy("tasttlig_users.tasttlig_user_id")
      // .groupBy("user_subscriptions.user_subscription_id")
      .groupBy("business_details.business_details_id")
      // .having("user_subscriptions.user_subscription_status", "=", "INACTIVE")
      .having("applications.status", "=", "Pending");

    return {
      success: true,
      applications,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getSponsorApplicantDetails = async (userId) => {
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
      .having("user_role_lookup.role_code", "=", "T7S8")
      .first();

   

    return {
      success: true,
      application,
    };
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
};

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
        return { success: false, message: "No user found." };
      }

      return { success: true, user: value };
    })
    .catch((error) => {
      return { success: false, message: error };
    });
};

const approveOrDeclineSponsorApplication = async (
  userId,
  status,
  declineReason, Details
) => {
  try {
  //   console.log(preference);
    console.log("userId from approveOrDeclineHostVendorApplication: " , userId);
    console.log("status from approveOrDeclineHostVendorApplication: " , status);
    console.log("declineReason from approveOrDeclineHostVendorApplication: " , declineReason);
    console.log("Details from approveOrDeclineHostVendorApplication: " , Details);

    const db_user_row = await getUserById(userId);
  //   console.log("got db user")
    const db_user = db_user_row.user;
  //   console.log("user details", db_user);
    let role = db_user.role;
    

    if (!db_user_row.success) {
      return { success: false, message: db_user_row.message };
    }

    

    // If status is approved
    if (status === "APPROVED") {

          await db("applications")
          .where("user_id", db_user.tasttlig_user_id)
          .andWhere("status", "Pending")
          .andWhere("type", "sponsor")
          .update("status", "APPROVED")
          .returning("*")
          .catch((reason) => {
              return { success: false, message: reason };
          });

          if(role.includes('BUSINESS_MEMBER_PENDING'))
          {
              await db("user_role_lookup")
              .where("user_id", db_user.tasttlig_user_id)
              .andWhere("role_code", "BMP1")
              .update("role_code", "BMA1")
              .catch((reason) => {
                  return { success: false, message: reason };
              });
          }

          if(role.includes('SPONSOR_PENDING'))
          {
              await db("user_role_lookup")
              .where("user_id", db_user.tasttlig_user_id)
              .andWhere("role_code", "T7S8")
              .update("role_code", "GP9A")
              .catch((reason) => {
                  return { success: false, message: reason };
              });

        // STEP 6: Email the user that their application is approved
            await Mailer.sendMail({
              from: process.env.SES_DEFAULT_FROM,
              to: db_user.email,
              subject: `[Tasttlig] Your request for upgradation to Sponsor is accepted`,
              template: "user_upgrade_approve",
              context: {
                first_name: db_user.first_name,
                last_name: db_user.last_name,
                role_name: Sponsor,
              },
            });
          }
    
  
    console.log("updated application status");

      return { success: true, message: status };
    } else {

          // Remove the role for this user
          await db("user_role_lookup")
          .where({
              user_id: db_user.tasttlig_user_id,
              role_code: "T7S8",
          })
          .del();
          // STEP 3: Update applications table status
          await db("applications")
          .where("user_id", db_user.tasttlig_user_id)
          .andWhere("status", "Pending")
          .andWhere("type", "sponsor")
          .update("status", "REJECT")
          .returning("*")
          .catch((reason) => {
              return { success: false, message: reason };
          });


        // STEP 6: Email the user that their application is approved
      // STEP 4: Notify user their application is rejected
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: db_user.email,
          subject: `[Tasttlig] Your request for upgradation to Sponsor is rejected`,
          template: "user_upgrade_reject",
          context: {
            first_name: db_user.first_name,
            last_name: db_user.last_name,
            declineReason,
          },
        });

      return { success: true, message: status };
    }
  } catch (error) {
    return { success: false, message: error };
  }
};



module.exports = {
  getUserSponsorships,
  getInKindUserSponsorships,
  getAllSponsorApplications,
  getSponsorApplicantDetails,
  approveOrDeclineSponsorApplication
}