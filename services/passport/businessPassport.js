"use strict";

// Libraries
const { db } = require("../../db/db-config");
const { generateRandomString } = require("../../functions/functions");

// Get user by ID helper function
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

const getBusinessApplications = async () => {
  try {
    const applications = await db
      .select("*")
      .from("applications")
      .leftJoin(
        "tasttlig_users",
        "applications.user_id",
        "tasttlig_users.tasttlig_user_id"
      )
      // .leftJoin(
      //   "food_samples",
      //   "applications.user_id",
      //   "food_samples.food_sample_creater_user_id"
      // )
      .groupBy("applications.application_id")
      .groupBy("tasttlig_users.tasttlig_user_id")
      // .groupBy("food_samples.food_sample_creater_user_id")
      .having("applications.status", "=", "Pending")
      .having("applications.type", "=", "business_member");

    return {
      success: true,
      applications,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getBusinessApplicantDetails = async (userId) => {
  try {
    console.log(userId)
    let application = await db
      .select("business_details.*",
      "business_details_images.*",
      "tasttlig_users.*",
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
      .having("user_role_lookup.role_code", "=", "BMP1")
      .first();

     console.log(application)

    return {
      success: true,
      application,
    };
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
};

const postBusinessPassportDetails = async (data) => {
  try {
    return await db.transaction(async (trx) => {
      const business_details = {
        business_details_user_id: data["user_id"],
        business_name: data["user_business_name"],
        business_street_number: data["user_business_street_number"],
        business_street_name: data["user_business_street_name"],
        business_unit: data["user_business_unit"],
        country: data["user_business_country"],
        city: data["user_business_city"],
        state: data["user_business_province"],
        zip_postal_code: data["user_business_postal_code"],
        business_registered: data["user_business_registered"],
        retail_business: data["user_business_retail"],
        business_registered_location: data["user_business_registered_location"],
        business_type: data["user_business_type"],
        food_business_type: data["user_business_food_type"],
        business_passport_id: generateRandomString("6"),
        business_details_registration_date: data["start_date"],
        business_member_status: data["member_status"],
        business_phone_number: data["user_business_phone_number"]
      };

      console.log(business_details)

      var business_details_id = await trx("business_details")
        .insert(business_details)
        .returning("business_details_id");

        console.log("detail id",business_details_id[0]);

      const business_details_images = {
        business_details_logo: data["user_business_logo"],
        food_handling_certificate: data["user_business_food_handling"],
        business_details_id: business_details_id[0],
      };

      await trx("business_details_images")
        .insert(business_details_images);

        console.log("inserted business images")
        
        return { success: true };
    });
  } catch (error) {
    
    if(error.detail.includes("already exists")) {
      return { success: false, details: "User Business Information already exists, you can edit your existing information under passport section in your profile" };
    }
    return { success: false, details: error.detail };
  }
};


const approveOrDeclineBusinessMemberApplication = async (
  userId,
  status,
  declineReason
) => {
  try {
    console.log("here entry")
    const db_user_row = await getUserById(userId);
   
    if (!db_user_row.success) {
      return { success: false, message: db_user_row.message };
    }

    console.log("here")
    const db_user = db_user_row.user;

    console.log("here 1")
    // // Get pending role which has been approved
    // let role_pending = "";
    // db_user.role.map((role) => {
    //   if (role.search("_PENDING") !== -1) {
    //     role_pending = role;
    //   }
    // });

    // Depends on status, we do different things:
    // If status is approved
    if (status === "APPROVED") {
      // Get role code of old role to be removed
      // const old_role_code = await db("roles")
      //   .select()
      //   .where({ role: "BMP1" })
      //   .then((value) => {
      //     return value[0].role_code;
      //   });

      // // Remove the role for this user
      // await db("user_role_lookup")
      //   .where({
      //     user_id: db_user.tasttlig_user_id,
      //     role_code: old_role_code,
      //   })
      //   .del();

      // // Get role code of new role to be added
      
      // const new_role_code = "BMA1"

      // console.log(new_role_code)

      // // Insert new role for this user
      // await db("user_role_lookup").insert({
      //   user_id: db_user.tasttlig_user_id,
      //   role_code: new_role_code,
        
      // });

      // update role
      console.log("updating")
      await db("user_role_lookup")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("role_code", "BMP1")
        .update("role_code", "BMA1")
        .catch((reason) => {
          return { success: false, message: reason };
        });
      
      // STEP 5: Update applications table status
      console.log("updated role")
      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .andWhere("type", "business_member")
        .update("status", "APPROVED")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

      console.log("updated applications")
      //Update status is business details table
        await db("business_details")
        .where("business_details_user_id", db_user.tasttlig_user_id)
        .update("business_member_status", "APPROVED")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

        console.log("updated business details")
      // let role_name_in_title_case =
      //   new_role.charAt(0).toUpperCase() + new_role.slice(1).toLowerCase();
      // let active_item = "Products";

/*       if (role_name_in_title_case === "Host") {
        active_item = "Experiences";
      } */

      // STEP 6: Email the user that their application is approved
      // await Mailer.sendMail({
      //   from: process.env.SES_DEFAULT_FROM,
      //   to: db_user.email,
      //   subject: `[Tasttlig] Your request for upgradation to Business Member is accepted`,
      //   template: "user_upgrade_approve",
      //   context: {
      //     first_name: db_user.first_name,
      //     last_name: db_user.last_name,
      //     role_name: role_name_in_title_case,
      //     active_item: active_item,
      //   },
      // });

      return { success: true, message: status };
    } else {
      // Status is failed
      // STEP 1: remove the RESTAURANT_PENDING role
      // Get role code of the role to be removed
      // let role_code = await db("roles")
      //   .select()
      //   .where({
      //     role: role_pending,
      //   })
      //   .then((value) => {
      //     return value[0].role_code;
      //   });

      // Remove the role for this user
      await db("user_role_lookup")
        .where({
          user_id: db_user.tasttlig_user_id,
          role_code: "BMP1",
        })
        .del();
      // STEP 3: Update applications table status
      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .andWhere("type", "business_member")
        .update("status", "REJECT")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

        //Update status is business details table
        await db("business_details")
        .where("business_details_user_id", db_user.tasttlig_user_id)
        .update("business_member_status", "REJECTED")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

      // let role_name_in_title_case =
      //   role_pending.split("_")[0].charAt(0).toUpperCase() +
      //   role_pending.split("_")[0].slice(1).toLowerCase();

      // STEP 4: Notify user their application is rejected
      // await Mailer.sendMail({
      //   from: process.env.SES_DEFAULT_FROM,
      //   to: db_user.email,
      //   subject: `[Tasttlig] Your request for upgradation to Business Member is rejected`,
      //   template: "user_upgrade_reject",
      //   context: {
      //     first_name: db_user.first_name,
      //     last_name: db_user.last_name,
      //     declineReason,
      //   },
      // });

      return { success: true, message: status };
    }
  } catch (error) {
    return { success: false, message: error };
  }
};

module.exports = {
  postBusinessPassportDetails,
  getBusinessApplications,
  getBusinessApplicantDetails,
  approveOrDeclineBusinessMemberApplication,
};
