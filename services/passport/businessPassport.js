"use strict";

// Libraries
const { db } = require("../../db/db-config");
const { generateRandomString } = require("../../functions/functions");
const user_order_service = require("../payment/user_orders");
const { Client } = require("@googlemaps/google-maps-services-js");

const mapsclient = new Client({});

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
      .groupBy("applications.application_id")
      .groupBy("tasttlig_users.tasttlig_user_id")
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

const getBusinessById = async (business_id) => {
  try {
    const business = await db
      .select(
        "business_details_id",
        "business_details_user_id",
        "business_phone_number",
        "business_name",
        "business_category",
        "business_location",
        "city",
        "state",
        "country",
        "zip_postal_code",
        "business_street_number",
        "business_street_name",
        "business_verification_code",
        "latitude",
        "longitude"
      )
      .from("business_details")
      .where("business_details_id", "=", business_id);

    return {
      success: true,
      business,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getBusinessApplicantDetails = async (userId) => {
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
      .having("user_role_lookup.role_code", "=", "BMP1")
      .first();

    console.log(application);

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
      let applications = [];
      let role_name = "";
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
        // business_registered: data["user_business_registered"],
        retail_business: data["user_business_retail"],
        // business_registered_location: data["user_business_registered_location"],
        business_type: data["user_business_type"],
        food_business_type: data["user_business_food_type"],
        // business_passport_id: generateRandomString("6"),
        business_details_registration_date: data["start_date"],
        business_member_status: data["member_status"],
        business_phone_number: data["user_business_phone_number"],
        // CRA_business_number: data["user_business_number"],
        business_preference: data["user_business_preference"],
      };

      var business_details_id = await trx("business_details")
        .insert(business_details)
        .returning("business_details_id");

      const business_details_images = {
        business_details_logo: data["user_business_logo"],
        food_handling_certificate: data["user_business_food_handling"],
        business_details_id: business_details_id[0],
      };

      await trx("business_details_images").insert(business_details_images);

      return { success: true };
    });
  } catch (error) {
    if (error && error.detail && error.detail.includes("already exists")) {
      return {
        success: false,
        details:
          "User Business Information already exists, you can edit your existing information under passport section in your profile. Your application for Business Member role has been sent to Admin",
      };
    }
    return { success: false, details: error.detail };
  }
};

// This function gets name, category, location, contact_info and insert them into business_details table
const postBusinessThroughFile = async (
  business_name,
  business_category,
  business_location,
  business_contact_info
) => {
  let duplication_id = await db
    .select("*")
    .from("business_details")
    .where("business_name", "=", business_name)
    .andWhere("business_location", "=", business_location)
    .first();

  if (duplication_id) {
    return { success: false, details: duplication_id.business_details_id };
  } else {
    const str1 = "BV";
    const str2 = generateRandomString("6");
    const verificationCode = str1.concat(str2);
    try {
      return await db.transaction(async (trx) => {
        let myString = business_location;
        let myCity = "Toronto";
        let myState = "ON";
        let myCountry = "Canada";
        let myZipPostalCode = "";
        let myBusinessStreetNumber = "";
        let myBusinessStreetName = "";
        let myUnit = null;

        // split location string at ,
        const myArr = myString.split(",").map((item) => item.trim());

        // find street name after first space
        let firstSplit = myArr[0];
        myBusinessStreetName = firstSplit.substr(firstSplit.indexOf(" ") + 1);

        // find unit number in format #-# else null
        if (myArr[0].split(" ")[0].includes("-")) {
          let myRe2 = /(\d+)-\d+/;
          myUnit = myArr[0].split(" ")[0].match(myRe2)[1];
        }

        // find street number
        let myRe = /(\d+)\s(\w+)/;
        const myMatch = myArr[0].match(myRe);
        myBusinessStreetNumber = myMatch[1];

        // find city and postal code
        myCity = myArr[1];
        myZipPostalCode = myArr[2].slice(3, myArr[2].length);

        let business_details = {
          business_name: business_name,

          business_category: business_category,

          business_location: business_location,

          business_phone_number: business_contact_info,
          city: myCity,
          state: myState,
          country: myCountry,
          zip_postal_code: myZipPostalCode,
          business_unit: myUnit,
          business_street_number: myBusinessStreetNumber,
          business_street_name: myBusinessStreetName,
          business_verification_code: verificationCode,
        };

        // let lat = null, lng = null;
        // heuristic for checking is address is enough for geocoding
        if (business_location && business_location !== "NA") {
          await mapsclient
            .geocode({
              params: {
                address: `${business_name} ${business_location}`,
                key: process.env.GOOGLE_MAPS_API_KEY,
              },
            })
            .then((response) => {
              const { lat, lng } = response.data.results[0].geometry.location;
              business_details = {
                latitude: lat,
                longitude: lng,
                ...business_details,
              };
            })
            .catch((error) => {
              console.error("geocoding failed", error.message);
              business_details = {
                latitude: null,
                longitude: null,
                ...business_details,
              };
            });
        } else {
          business_details = {
            latitude: null,
            longitude: null,
            ...business_details,
          };
        }

        var business_details_id = await trx("business_details")
          .insert(business_details)
          .returning("business_details_id");

        return { success: true, details: business_details_id };
      });
    } catch (error) {
      if (error && error.detail && error.detail.includes("already exists")) {
        return {
          success: false,
          details:
            "User Business Information already exists, you can edit your existing information under passport section in your profile. Your application for Business Member role has been sent to Admin",
        };
      }
      return { success: false, details: error.detail };
    }
  }
};

const approveOrDeclineBusinessMemberApplication = async (
  userId,
  status,
  declineReason,
  businessDetails
) => {
  try {
    console.log("here entry");
    const db_user_row = await getUserById(userId);

    if (!db_user_row.success) {
      return { success: false, message: db_user_row.message };
    }

    const db_user = db_user_row.user;

    // If status is approved
    if (status === "APPROVED") {
      // update role
      await db("user_role_lookup")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("role_code", "BMP1")
        .update("role_code", "BMA1")
        .catch((reason) => {
          return { success: false, message: reason };
        });
      // remove restaurant role if it's already there
      await db("user_role_lookup")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("role_code", "RT")
        .del()
        .catch((reason) => {
          return { success: false, message: reason };
        });

      if (businessDetails.application.food_business_type === "Restaurant") {
        console.log(businessDetails.application.food_business_type);
        await db("user_role_lookup")
          .insert({
            user_id: db_user.tasttlig_user_id,
            role_code: "RT",
          })
          .returning("*")
          .catch((reason) => {
            console.log("Reason", reason);
            return { success: false, message: reason };
          });
      }

      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .andWhere("type", "business_member")
        .update("status", "APPROVED")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

      const str1 = "BP";
      const str2 = generateRandomString("6");
      const newString = str1.concat(str2);

      var d = new Date();
      var year = d.getFullYear();
      var month = d.getMonth();
      var day = d.getDate();

      console.log("updated applications");
      //Update status is business details table
      await db("business_details")
        .where("business_details_user_id", db_user.tasttlig_user_id)
        .update({
          business_member_status: "APPROVED",
          business_passport_id: "BP" + generateRandomString("6"),
          business_detail_approval_date: new Date(),
          business_detail_expiry_date: new Date(year + 5, month, day),
        })
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

      console.log("updated business details");

      await db("user_subscriptions")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("subscription_code", "H_BASIC")
        .update({
          user_subscription_status: "ACTIVE",
          subscription_start_datetime: new Date(),
          subscription_end_datetime: new Date(
            new Date().setMonth(new Date().getMonth() + Number(30))
          ),
        })
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

      console.log("updated business details");

      return { success: true, message: status };
    } else {
      //Remove the role for this user
      await db("user_role_lookup")
        .where({
          user_id: db_user.tasttlig_user_id,
          role_code: "BMP1",
        })
        .del();
      // STEP 3: Update applications table status
      // await db("applications")
      //   .where("user_id", db_user.tasttlig_user_id)
      //   .andWhere("status", "Pending")
      //   .andWhere("type", "business_member")
      //   .update("status", "REJECT")
      //   .returning("*")
      //   .catch((reason) => {
      //     return { success: false, message: reason };
      //   });

      //Remove row in business details images table
      await db("business_details_images")
        .where(
          "business_details_id",
          businessDetails.application.business_details_id
        )
        // .update("business_member_status", "REJECTED")
        // .returning("*")
        .del()
        .catch((reason) => {
          return { success: false, message: reason };
        });

      //Remove row in business details table
      await db("business_details")
        .where("business_details_user_id", db_user.tasttlig_user_id)
        // .update("business_member_status", "REJECTED")
        // .returning("*")
        .del()
        .catch((reason) => {
          return { success: false, message: reason };
        });
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
  postBusinessThroughFile,
  getBusinessById,
};
