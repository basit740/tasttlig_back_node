"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const { formatTime, generateSlug } = require("../../functions/functions");
// const festival_service = require("../../services/festival/festival");
const user_profile_service = require("../../services/profile/user_profile");
const { generateRandomString } = require("../../functions/functions");

// Get all festivals helper function
const getAllFestivals = async (currentPage, keyword, filters) => {
  let startDate;
  let startTime;

  if (filters.startDate) {
    startDate = filters.startDate.substring(0, 10);
  }
  if (filters.startTime) {
    startTime = formatTime(filters.startTime);
  }
  let query = db
    .select(
      "festivals.*",
      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls"),
      db.raw("ARRAY_AGG(festival_business_lists.list_file_location) as business_list")
    )
    .from("festivals")
    .leftJoin(
      "festival_images",
      "festivals.festival_id",
      "festival_images.festival_id"
    )
    .leftJoin(
      "festival_business_lists",
      "festivals.festival_id",
      "festival_business_lists.list_festival_id"
    )
    .where("festivals.festival_id", ">", 3)
    .where("festivals.festival_end_date", ">=", new Date())
    .groupBy("festivals.festival_id")
    .orderBy("festival_start_date");

  // if (filters.nationalities && filters.nationalities.length) {
  //   query.whereIn("nationalities.nationality", filters.nationalities);
  // }

  if (filters.startDate) {
    query.where("festivals.festival_end_date", ">=", startDate);
    // .where("festivals.festival_start_date", ">=", startDate);
  }

  if (filters.startTime) {
    query.where("festivals.festival_start_time", ">=", startTime);
  }

  if (filters.cityLocation) {
    query.where("festivals.festival_city", "=", filters.cityLocation);
  }

  //if (filters.dayOfWeek) {
  /* query.whereRaw("Day(festivals.festival_start_time) = ?", [
      filters.dayOfWeek,
    ]); */
  //query.where(knex.datePart("dow", "festivals.festival_start_date"), "=", 0);
  //}

  if (keyword) {
    query = db
      .select(
        "*",
        db.raw(
          "CASE WHEN (phraseto_tsquery('??')::text = '') THEN 0 " +
            "ELSE ts_rank_cd(main.search_text, (phraseto_tsquery('??')::text || ':*')::tsquery) " +
            "END rank",
          [keyword, keyword]
        )
      )
      .from(
        db
          .select(
            "main.*",
            db.raw(
              "to_tsvector(concat_ws(' '," +
                // "main.nationality, " +
                "main.festival_name, " +
                "main.festival_type, " +
                "main.festival_price, " +
                // "main.festival_city)) as search_text"
                "main.festival_city, " +
                // "main.description)) as search_text"
                "main.festival_description)) as search_text"
            )
          )
          .from(query.as("main"))
          .as("main")
      )
      .orderBy("rank", "desc");
  }

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

const getAllFestivalList = async (currentPage, keyword, filters) => {
  let startDate;
  let startTime;
  let user_id;

  if (filters.startDate) {
    startDate = filters.startDate.substring(0, 10);
  }
  if (filters.startTime) {
    startTime = formatTime(filters.startTime);
  }
  if (filters.user_id) {
    user_id = filters.user_id;
  }
  let query = db
    .select(
      "festivals.*",
      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
    )
    .from("festivals")
    .leftJoin(
      "festival_images",
      "festivals.festival_id",
      "festival_images.festival_id"
    )
    .where("festivals.festival_id", ">", 3)
    //.where("festivals.festival_end_date", ">=", new Date())
    .groupBy("festivals.festival_id")
    .having("festivals.festival_host_admin_id[1]", "=", Number(user_id))
    .orderBy("festival_start_date");

  if (filters.nationalities && filters.nationalities.length) {
    query.whereIn("nationalities.nationality", filters.nationalities);
  }

  if (filters.startDate) {
    query.where("festivals.festival_end_date", ">=", startDate);
    // .where("festivals.festival_start_date", ">=", startDate);
  }

  if (filters.startTime) {
    query.where("festivals.festival_start_time", ">=", startTime);
  }

  if (filters.cityLocation) {
    query.where("festivals.festival_city", "=", filters.cityLocation);
  }

  //if (filters.dayOfWeek) {
  /* query.whereRaw("Day(festivals.festival_start_time) = ?", [
      filters.dayOfWeek,
    ]); */
  //query.where(knex.datePart("dow", "festivals.festival_start_date"), "=", 0);
  //}

  if (keyword) {
    query = db
      .select(
        "*",
        db.raw(
          "CASE WHEN (phraseto_tsquery('??')::text = '') THEN 0 " +
            "ELSE ts_rank_cd(main.search_text, (phraseto_tsquery('??')::text || ':*')::tsquery) " +
            "END rank",
          [keyword, keyword]
        )
      )
      .from(
        db
          .select(
            "main.*",
            db.raw(
              "to_tsvector(concat_ws(' '," +
                "main.nationality, " +
                "main.festival_name, " +
                "main.festival_type, " +
                "main.festival_price, " +
                "main.festival_city, " +
                "main.description)) as search_text"
            )
          )
          .from(query.as("main"))
          .as("main")
      )
      .orderBy("rank", "desc");
  }

  query = query.paginate({
    perPage: 12,
    isLengthAware: true,
    currentPage: currentPage,
  });

  return await query
    .then((value) => {
      value.map((festival) => {
        delete festival.promo_code;
      });

      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

const getAllHostFestivalList = async (filters) => {
  let user_id;

  if (filters.user_id) {
    user_id = filters.user_id;
  }
  let query = db
    .select(
      "festivals.*",
      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
    )
    .from("festivals")
    .leftJoin(
      "festival_images",
      "festivals.festival_id",
      "festival_images.festival_id"
    )
    .where("festivals.festival_id", ">", 3)
    //.where("festivals.festival_end_date", ">=", new Date())
    .groupBy("festivals.festival_id")
    .having("festivals.festival_host_admin_id[1]", "=", Number(user_id))
    .orderBy("festival_start_date");

  return await query
    .then((value) => {
      value.map((festival) => {
        delete festival.promo_code;
      });
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

const getAllFestivalsPresent = async () => {
  return await db
    .select(
      "festivals.*",
      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
    )
    .from("festivals")
    .leftJoin(
      "festival_images",
      "festivals.festival_id",
      "festival_images.festival_id"
    )
    .where("festivals.festival_id", ">", 3)
    .where("festivals.festival_end_date", ">=", new Date())
    .groupBy("festivals.festival_id")
    .then((value) => {
      value.map((festival) => {
        delete festival.promo_code;
      });
      return { success: true, festival_list: value };
    })
    .catch((reason) => {
      return { success: false, data: reason };
    });
};

const getThreeFestivals = async (currentPage, keyword, filters) => {
  let startDate = filters.startDate.substring(0, 10);
  let startTime = formatTime(filters.startTime);
  let query = db
    .select(
      "festivals.*",
      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
    )
    .from("festivals")
    .leftJoin(
      "festival_images",
      "festivals.festival_id",
      "festival_images.festival_id"
    )
    .where("festivals.festival_id", ">", 3)
    .where("festivals.festival_end_date", ">=", new Date())
    .groupBy("festivals.festival_id");

  if (filters.nationalities && filters.nationalities.length) {
    query.whereIn("nationalities.nationality", filters.nationalities);
  }

  if (filters.startDate) {
    query.where("festivals.festival_start_date", ">=", startDate);
  }

  if (filters.startTime) {
    query.where("festivals.festival_start_time", ">=", startTime);
  }

  if (filters.cityLocation) {
    query.where("festivals.festival_city", "=", filters.cityLocation);
  }

  if (keyword) {
    query = db
      .select(
        "*",
        db.raw(
          "CASE WHEN (phraseto_tsquery('??')::text = '') THEN 0 " +
            "ELSE ts_rank_cd(main.search_text, (phraseto_tsquery('??')::text || ':*')::tsquery) " +
            "END rank",
          [keyword, keyword]
        )
      )
      .from(
        db
          .select(
            "main.*",
            db.raw(
              "to_tsvector(concat_ws(' '," +
                "main.nationality, " +
                "main.festival_name, " +
                "main.festival_type, " +
                "main.festival_price, " +
                "main.festival_city, " +
                "main.description)) as search_text"
            )
          )
          .from(query.as("main"))
          .as("main")
      )
      .orderBy("rank", "desc");
  }

  query = query.paginate({
    perPage: 3,
    isLengthAware: true,
    currentPage: currentPage,
  });

  return await query
    .then((value) => {
      value.map((festival) => {
        delete festival.promo_code;
      });
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

/* const getAllFestivalsPresent = async () => {
  return await db
    .select("festivals.*")
    .from("festivals")
    .where("festivals.festival_id", ">", 3)
    .groupBy("festivals.festival_id")
    .then((value) => {
      return { success: true, festival_list: value };
    })
    .catch((reason) => {
      return { success: false, data: reason };
    });
}; */

// Get festival list helper function
const getFestivalList = async () => {
  return await db
    .select("festivals.*")
    .from("festivals")
    .where("festivals.festival_id", ">", 3)
    .where("festivals.festival_end_date", ">=", new Date())
    .groupBy("festivals.festival_id")
    .then((value) => {
      value.map((festival) => {
        delete festival.promo_code;
      });
      return { success: true, festival_list: value };
    })
    .catch((reason) => {
      return { success: false, data: reason };
    });
};

// Get festival list only past and current, no future dates
const getFestivalListNoFuture = async () => {
  return await db
    .select("festivals.festival_id", "festivals.festival_name")
    .from("festivals")
    .where("festivals.festival_id", ">", 3)
    .where("festivals.festival_start_date", "<=", new Date())
    .groupBy("festivals.festival_id")
    .orderBy("festivals.festival_name")
    .then((value) => {
      value.map((festival) => {
        delete festival.promo_code;
      });
      return { success: true, festival_list: value };
    })
    .catch((reason) => {
      return { success: false, data: reason };
    });
};

/* Save new festival to festivals and festival images tables helper 
function */
const createNewFestival = async (festival_details, festival_images, business_file) => {
  try {
    let db_festival;

    await db.transaction(async (trx) => {
      festival_details.basic_passport_id = "M" + generateRandomString("6");

      // generate a promo code
      let promo_code = generateRandomString(10);
      const existing = await trx("festivals").select("promo_code");
      while (existing.includes(promo_code)) {
        promo_code = generateRandomString(10);
      }
      festival_details.promo_code = promo_code;

      // create the slug for the festival
      festival_details.slug = generateSlug(festival_details.festival_name);

      console.log("Festival Details", festival_details);

      db_festival = await trx("festivals")
        .insert(festival_details)
        .returning("*");

      if (!db_festival) {
        return { success: false, details: "Inserting new festival failed." };
      }

      // insert festival image
      const images = festival_images.map((festival_image_url) => ({
        festival_id: db_festival[0].festival_id,
        festival_image_url,
      }));
      await trx("festival_images").insert(images);

      // insert festival business list file location
      const business_list = {
        list_festival_id: db_festival[0].festival_id,
        list_file_location: business_file
      }
      await trx("festival_business_lists").insert(business_list);
    });

    return { success: true, details: db_festival[0].festival_id };
  } catch (error) {
    console.log(error.message);
    return { success: false, details: error.message };
  }
};

// Add host ID to festivals table helper function
const hostToFestival = async (
  festival_id,
  foodSamplePreference,
  db_user,
  applicationType
) => {
  try {
    await db.transaction(async (trx) => {
      if (typeof festival_id === "object") {
        for (let item of festival_id) {
          try {
            if (db_user.role.includes("HOST") && applicationType === "Host") {
              var host_ids = await db("festivals")
                .select("festival_host_id")
                .where("festival_id", "=", item)
                .then((resp) => {
                  return resp;
                });

              if (
                !host_ids[0].festival_host_id.includes(db_user.tasttlig_user_id)
              ) {
                host_ids[0].festival_host_id.push(db_user.tasttlig_user_id);
                await db("festivals")
                  .where({ festival_id: festival_id })
                  .update({ festival_host_id: host_ids[0].festival_host_id });
              }
            } else if (
              db_user.role.includes("VENDOR") ||
              db_user.role.includes("BUSINESS_MEMBER") ||
              (db_user.role.includes("BUSINESS_MEMBER_PENDING") &&
                applicationType === "Vendor")
            ) {
              // && !db_user.role.includes("HOST") && !db_user.role.includes("HOST_PENDING"))
              var vendor_ids = await db("festivals")
                .select("festival_vendor_id")
                .where("festival_id", "=", item)
                .then((resp) => {
                  return resp;
                });

              var vendor_ids_array = vendor_ids[0].festival_vendor_id || [];
              if (!vendor_ids_array.includes(db_user.tasttlig_user_id)) {
                vendor_ids_array.push(db_user.tasttlig_user_id);
                await db("festivals")
                  .where({ festival_id: item })
                  .update({ festival_vendor_id: vendor_ids_array });
              }

              if (!db_user.role.includes("VENDOR")) {
                // Get role code of new role to be added
                const new_role_code = await trx("roles")
                  .select()
                  .where({ role: "VENDOR" })
                  .then((value) => {
                    return value[0].role_code;
                  });

                // Insert new role for this user
                await trx("user_role_lookup").insert({
                  user_id: db_user.tasttlig_user_id,
                  role_code: new_role_code,
                });
              }
            }
          } catch (error) {
            return { success: false };
          }
          console.log(
            "festival_id coming from host to festival:",
            typeof foodSamplePreference
          );

          var db_host;
          if (typeof foodSamplePreference === "object") {
            for (let sample of foodSamplePreference) {
              db_host = await trx("products")
                .where({ product_id: sample })
                .update({
                  festival_selected: trx.raw(
                    "array_append(festival_selected, ?)",
                    item
                  ),
                })
                .returning("*");
            }
          }

          if (!db_host) {
            return { success: false, details: "Inserting new host failed." };
          }
        }
      } else {
        // const db_host = await trx("festivals")
        //   .where({ festival_id })
        //   .update({
        //     festival_host_id: trx.raw("array_append(festival_host_id, ?)", [
        //       festival_host_id,
        //     ]),
        //   })
        //   .returning("*");

        try {
          if (db_user.role.includes("HOST")) {
            var host_ids = await db("festivals")
              .select("festival_host_id")
              .where({ festival_id })
              .then((resp) => {
                return resp;
              });

            if (!host_ids.includes(db_user.tasttlig_user_id)) {
              host_ids.push(db_user.tasttlig_user_id);
              await db("festivals")
                .where({ festival_id: festival_id })
                .update({ festival_host_id: host_ids });
            }
          } else if (db_user.role.includes("VENDOR")) {
            var vendor_ids = await db("festivals")
              .select("festival_vendor_id")
              .where({ festival_id })
              .then((resp) => {
                return resp;
              });

            var vendor_ids_array = vendor_ids[0].festival_vendor_id || [];
            if (!vendor_ids_array.includes(db_user.tasttlig_user_id)) {
              vendor_ids_array.push(db_user.tasttlig_user_id);
              await db("festivals")
                .where({ festival_id: festival_id })
                .update({ festival_vendor_id: vendor_ids_array });
            }
          }
        } catch (error) {
          return { success: false };
        }

        if (typeof foodSamplePreference === "Array") {
          for (let sample of foodSamplePreference) {
            const db_host = await trx("products")
              .where({ product_id: sample })
              .update({
                festival_selected: trx.raw(
                  "array_append(festival_selected, ?)",
                  festival_id
                ),
              })
              .returning("*");
          }
        }
        if (!db_host) {
          return { success: false, details: "Inserting new host failed." };
        }
      }
    });
    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

const addVendorApplication = async (
  festival_id,
  foodSamplePreference,
  db_user,
  applicationType
) => {
  try {
    await db.transaction(async (trx) => {
      if (typeof festival_id === "object") {
        for (let item of festival_id) {
          try {
            if (
              db_user.role.includes("VENDOR") ||
              db_user.role.includes("BUSINESS_MEMBER") ||
              (db_user.role.includes("BUSINESS_MEMBER_PENDING") &&
                applicationType === "Vendor")
            ) {
              var vendor_application_ids = await db("festivals")
                .select("vendor_request_id")
                .where("festival_id", "=", item)
                .then((resp) => {
                  return resp;
                });

              var vendor_ids_array =
                vendor_application_ids[0].vendor_request_id || [];
              if (!vendor_ids_array.includes(db_user.tasttlig_user_id)) {
                vendor_ids_array.push(db_user.tasttlig_user_id);
                await db("festivals")
                  .where({ festival_id: item })
                  .update({ vendor_request_id: vendor_ids_array });
              }

              if (
                !db_user.role.includes("VENDOR") &&
                !db_user.role.includes("VENDOR_PENDING")
              ) {
                // Get role code of new role to be added
                const new_role_code = await trx("roles")
                  .select()
                  .where({ role: "VENDOR_PENDING" })
                  .then((value) => {
                    return value[0].role_code;
                  });

                // Insert new role for this user
                await trx("user_role_lookup").insert({
                  user_id: db_user.tasttlig_user_id,
                  role_code: new_role_code,
                });
              }
            }
          } catch (error) {
            return { success: false };
          }
          console.log(
            "festival_id coming from host to festival:",
            typeof foodSamplePreference
          );

          // var db_host;
          // if (typeof foodSamplePreference === "object") {
          //   for (let sample of foodSamplePreference) {
          //     db_host = await trx("products")
          //       .where({ product_id: sample })
          //       .update({
          //         festival_selected: trx.raw(
          //           "array_append(festival_selected, ?)",
          //           item
          //         ),
          //       })
          //       .returning("*");
          //   }
          // }

          //   if (!db_host) {
          //   return { success: false, details: "Inserting new host failed." };
          // }
        }
      } else {
        try {
          if (db_user.role.includes("VENDOR")) {
            var vendor_application_ids = await db("festivals")
              .select("vendor_request_id")
              .where({ festival_id })
              .then((resp) => {
                return resp;
              });

            var vendor_ids_array =
              vendor_application_ids[0].vendor_request_id || [];
            if (!vendor_ids_array.includes(db_user.tasttlig_user_id)) {
              vendor_ids_array.push(db_user.tasttlig_user_id);
              await db("festivals")
                .where({ festival_id: festival_id })
                .update({ vendor_request_id: vendor_ids_array });
            }
          }
        } catch (error) {
          return { success: false };
        }

        if (typeof foodSamplePreference === "Array") {
          for (let sample of foodSamplePreference) {
            const db_host = await trx("products")
              .where({ product_id: sample })
              .update({
                festival_selected: trx.raw(
                  "array_append(festival_selected, ?)",
                  festival_id
                ),
              })
              .returning("*");
          }
        }
        if (!db_host) {
          return { success: false, details: "Inserting new host failed." };
        }
      }
    });
    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

const addSponsorApplication = async (festival_id, db_user, applicationType) => {
  try {
    await db.transaction(async (trx) => {
      if (typeof festival_id === "object") {
        for (let item of festival_id) {
          try {
            if (
              db_user.role.includes("SPONSOR") ||
              db_user.role.includes("SPONSOR_PENDING") ||
              applicationType === "Sponsor"
            ) {
              var sponsor_application_ids = await db("festivals")
                .select("sponsor_request_id")
                .where("festival_id", "=", item)
                .then((resp) => {
                  return resp;
                });

              var sponsor_ids_array =
                sponsor_application_ids[0].sponsor_request_id || [];
              if (!sponsor_ids_array.includes(db_user.tasttlig_user_id)) {
                sponsor_ids_array.push(db_user.tasttlig_user_id);
                await db("festivals")
                  .where({ festival_id: item })
                  .update({ sponsor_request_id: sponsor_ids_array });
              }

              if (!db_user.role.includes("SPONSOR")) {
                // Get role code of new role to be added
                const new_role_code = await trx("roles")
                  .select()
                  .where({ role: "SPONSOR" })
                  .then((value) => {
                    return value[0].role_code;
                  });

                // Insert new role for this user
                await trx("user_role_lookup").insert({
                  user_id: db_user.tasttlig_user_id,
                  role_code: new_role_code,
                });
              }
            }
          } catch (error) {
            return { success: false };
          }
        }
      } else {
        try {
          var sponsor_application_ids = await db("festivals")
            .select("sponsor_request_id")
            .where({ festival_id })
            .then((resp) => {
              return resp;
            });

          var sponsor_ids_array =
            sponsor_application_ids[0].sponsor_request_id || [];
          if (!sponsor_ids_array.includes(db_user.tasttlig_user_id)) {
            sponsor_ids_array.push(db_user.tasttlig_user_id);
            await db("festivals")
              .where({ festival_id: festival_id })
              .update({ sponsor_request_id: sponsor_ids_array });
          }
        } catch (error) {
          return { success: false };
        }

        if (!db_host) {
          return { success: false, details: "Inserting new host failed." };
        }
      }
    });
    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// add neighbourhood sponsor
const addNeighbourhoodSponsor = async (festival_id, user_id) => {
  try {
    await db.transaction(async (trx) => {
      try {
        for (let festival of festival_id) {
          await db.transaction(async (trx) => {
            await trx("festivals")
              .where("festival_id", Number(festival))
              .update({
                neighbourhood_sponsor_id: db.raw(
                  "array_append(neighbourhood_sponsor_id, ?)",
                  [Number(user_id)]
                ),
              })
              .returning("*")
              .catch(() => {
                return { success: false };
              });
          });
        }
      } catch (error) {
        return { success: false };
      }
    });
    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// create restaurant application
const addRestaurantApplication = async (festival_id, db_user) => {
  try {
    await db.transaction(async (trx) => {
      try {
        for (let festival of festival_id) {
          const db_festival = await getFestivalDetails(festival);

          await trx("applications").insert({
            user_id: db_user.tasttlig_user_id,
            created_at: new Date(),
            updated_at: new Date(),
            receiver_id: db_festival.details[0].festival_host_admin_id[0],
            reason: "restaurant application",
            type: "restaurant",
            status: "Pending",
            festival_id: festival,
          });
        }
      } catch (error) {
        return { success: false };
      }
    });
    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

const addBusinessToFestival = async (festival_id, user_id) => {
  try {
    await db.transaction(async (trx) => {
      if (typeof festival_id === "object") {
        for (let item of festival_id) {
          var vendor_id = await db("festivals")
            .select("festival_vendor_id")
            .where("festival_id", "=", item)
            .then((resp) => {
              return resp;
            });
          let vendor_id_array = vendor_id[0].festival_vendor_id || [];
          if (!vendor_id_array.includes(user_id)) {
            vendor_id_array.push(user_id);
            await db("festivals")
              .where({ festival_id: item })
              .update({ festival_vendor_id: vendor_id_array });
          }
        }
      }
    });
    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

const updateFestival = async (data, festival_images, business_file) => {
  try {
    await db.transaction(async (trx) => {
      // generate new slug according to its name
      const slug = generateSlug(data.festival_name);

      const db_festival = await trx("festivals")
        .where({ festival_id: data.festival_id })
        .update({
          festival_name: data.festival_name,
          festival_type: data.festival_type,
          festival_price: data.festival_price,
          festival_city: data.festival_city,
          festival_start_date: data.festival_start_date,
          festival_end_date: data.festival_end_date,
          festival_start_time: data.festival_start_time,
          festival_end_time: data.festival_end_time,
          festival_description: data.festival_description,
          festival_vendor_price: data.festival_vendor_price,
          festival_sponsor_price: data.festival_sponsor_price,
          festival_postal_code: data.festival_postal_code,
          festival_country: data.festival_country,
          festival_province: data.festival_province,
          slug: slug
        })
        .returning("*");

      //update festival image
      await trx("festival_images")
        .where({ festival_id: data.festival_id })
        .update({ festival_image_url: festival_images[0] })
        .returning("*");

      //update festival image
      await trx("festival_business_lists")
        .where({ list_festival_id: data.festival_id })
        .update({ list_file_location: business_file })
        .returning("*");

    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Add sponsor to festivals table helper function
const sponsorToFestival = async (
  festival_id,
  festival_business_sponsor_id,
  db_user
) => {
  try {
    let role = db_user.user.role;
    await db.transaction(async (trx) => {
      const db_sponsor_festival = await trx("festivals")
        .where({ festival_id })
        .update({
          festival_business_sponsor_id: trx.raw(
            "array_append(festival_business_sponsor_id, ?)",
            [festival_business_sponsor_id]
          ),
        })
        .returning("*");

      if (!db_sponsor_festival) {
        return { success: false, details: "Inserting new sponsor failed." };
      }
      if (!role.includes("SPONSOR")) {
        // Get role code of new role to be added
        const new_role_code = await trx("roles")
          .select()
          .where({ role: "SPONSOR" })
          .then((value) => {
            return value[0].role_code;
          });

        // Insert new role for this user
        await trx("user_role_lookup").insert({
          user_id: db_user.user.tasttlig_user_id,
          role_code: new_role_code,
        });
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Get festival details helper function
const getFestivalDetails = async (festival_id, user = null) => {
  return await db
    .select(
      "festivals.*",
      "b1.business_name AS business",
      "b2.business_name AS sponsor",
      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
    )
    .from("festivals")
    .leftJoin(
      "festival_images",
      "festivals.festival_id",
      "festival_images.festival_id"
    )
    .leftJoin(
      "business_details AS b1",
      "festivals.festival_host_admin_id[1]",
      "b1.business_details_user_id"
    )
    .leftJoin(
      "sponsors",
      "festivals.festival_business_sponsor_id[1]",
      "sponsors.sponsor_id"
    )
    .leftJoin(
      "business_details AS b2",
      "sponsors.sponsor_business_id",
      "b2.business_details_user_id"
    )
    .groupBy("festivals.festival_id")
    .groupBy("b1.business_name")
    .groupBy("b2.business_name")
    .having("festivals.festival_id", "=", festival_id)
    .having("festivals.festival_end_date", ">=", new Date())
    .then((value) => {
      value.map((festival) => {
        if (
          !(user && user.role.includes("ADMIN")) &&
          !(
            festival &&
            festival.festival_host_id &&
            festival.festival_host_id.includes(user && user.id)
          ) &&
          !(
            festival &&
            festival.festival_host_admin_id &&
            festival.festival_host_admin_id.includes(user && user.id)
          )
        ) {
          delete festival.promo_code;
        }
      });

      return {
        success: true,
        details: value,
      };
    })
    .catch((reason) => {
      console.log("LOOKUP FAILED", reason);
      return { success: false, details: reason };
    });
};

const getFestivalDetailsBySlug = async (slug, user = null) => {
  let festival_ids = await db("festivals")
    .select("festival_id")
    .where("slug", slug)
    .orderBy("festival_id");
  festival_ids = festival_ids.map(value => value.festival_id);
  if (festival_ids.length === 0) {
    // then slug must be an id
    festival_ids = [slug];
  }

  const result = await getFestivalDetails(
    festival_ids[festival_ids.length - 1],
    user
  );
  return result;
};

const getFestivalRestaurants = async (host_id, festival_id) => {
  let productQuery = db
    .select(
      "products.*",
      "business_details.*"
      /*  db.raw("ARRAY_AGG(business_details_images.business_details_image_url) as image_urls") */
    )
    .from("products")
    .leftJoin(
      "business_details",
      "products.product_business_id",
      "business_details.business_details_id"
    )
    .leftJoin(
      "product_images",
      "products.product_id",
      "product_images.product_id"
    )
    .groupBy("business_details.business_details_id")
    .groupBy("products.title")
    .having("products.product_business_id", "=", host_id[0]);

  return await productQuery
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

const attendFestival = async (user_id, festival_id) => {
  try {
    await db.transaction(async (trx) => {
      const db_guest = await trx("festivals")
        .where({ festival_id: festival_id })
        .update({
          festival_user_guest_id: trx.raw(
            "array_append(festival_user_guest_id, ?)",
            [user_id]
          ),
        })
        .returning("*");

      if (!db_guest) {
        return { success: false, details: "Inserting guest failed." };
      }

      // fetch festival passport id
      const festival = await getFestivalDetails(festival_id);

      // insert festival passport into user
      const db_passport = await trx("passport_details")
        .insert({
          passport_user_id: user_id,
          passport_festival_id: festival_id,
          passport_id: festival.details[0].basic_passport_id,
          passport_type: "BASIC",
        })
        .returning("*");

      if (!db_passport) {
        return { success: false, details: "Inserting passport failed." };
      }
    });

    // Email to user on successful purchase
    // await Mailer.sendMail({
    //   from: process.env.SES_DEFAULT_FROM,
    //   to: user_email,
    //   bcc: ADMIN_EMAIL,
    //   subject: "[Tasttlig] Festival Attendance Successful",
    //   template: "festival/attend_festival",
    //   context: {
    //     title: festival.details[0].festival_name,
    //     items: [
    //       {
    //         title: festival.details[0].festival_name,
    //         address: festival.details[0].festival_city,
    //         day: moment(
    //           moment(
    //             new Date(festival.details[0].festival_start_date)
    //               .toISOString()
    //               .split("T")[0] +
    //               "T" +
    //               festival.details[0].festival_start_time +
    //               ".000Z"
    //           ).add(new Date().getTimezoneOffset(), "m")
    //         ).format("MMM Do YYYY"),
    //         time:
    //           moment(
    //             moment(
    //               new Date(festival.details[0].festival_start_date)
    //                 .toISOString()
    //                 .split("T")[0] +
    //                 "T" +
    //                 festival.details[0].festival_start_time +
    //                 ".000Z"
    //             ).add(new Date().getTimezoneOffset(), "m")
    //           ).format("hh:mm a") +
    //           " - " +
    //           moment(
    //             moment(
    //               new Date(festival.details[0].festival_start_date)
    //                 .toISOString()
    //                 .split("T")[0] +
    //                 "T" +
    //                 festival.details[0].festival_end_time +
    //                 ".000Z"
    //             ).add(new Date().getTimezoneOffset(), "m")
    //           ).format("hh:mm a"),
    //         quantity: 1,
    //       },
    //     ],
    //   },
    // });

    return { success: true, details: "Success" };
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }
};

// remove attend festival
const removeAttendance = async (festival_id, user_id) => {
  try {
    const festival = await getFestivalDetails(festival_id);

    await db.transaction(async (trx) => {
      const db_guest = await trx("festivals")
        .where({ festival_id: festival.details[0].festival_id })
        .update({
          festival_user_guest_id: trx.raw(
            "array_remove(festival_user_guest_id, ?)",
            [user_id]
          ),
        })
        .returning("*");

      if (!db_guest) {
        return { success: false, details: "Inserting guest failed." };
      }
    });

    return { success: true, details: "Success" };
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }
};

// get festival using a passport id
const getFestivalByPassport = async (passport_id) => {
  return await db
    .select(
      "festivals.*",
      db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
    )
    .from("festivals")
    .leftJoin(
      "festival_images",
      "festivals.festival_id",
      "festival_images.festival_id"
    )
    .where("festivals.basic_passport_id", "=", passport_id)
    .where("festivals.festival_end_date", ">=", new Date())
    .groupBy("festivals.festival_id")
    .then((value) => {
      value.map((festival) => {
        delete festival.promo_code;
      });
      return { success: true, details: value };
    })
    .catch((error) => {
      return { success: false, details: error };
    });
};

// get festivals using array of passport ids
const getFestivalByPassports = async (passport_ids) => {
  let festival_list = [];
  for (let passport_id of passport_ids) {
    await db
      .select(
        "festivals.*",
        db.raw("ARRAY_AGG(festival_images.festival_image_url) as image_urls")
      )
      .from("festivals")
      .leftJoin(
        "festival_images",
        "festivals.festival_id",
        "festival_images.festival_id"
      )
      .where("festivals.basic_passport_id", "=", passport_id)
      .where("festivals.festival_end_date", ">=", new Date())
      .groupBy("festivals.festival_id")
      .then((value) => {
        value.map((festival) => {
          delete festival.promo_code;
        });
        festival_list = festival_list.concat(value);
        // return { success: true, festival_list: value };
      })
      .catch((error) => {
        return { success: false, details: error };
      });
  }
  return { success: true, value: festival_list };
};



const registerUserToFestivals = async (user_id, festival_ids) => {
  try {
    for (let festival_id of festival_ids) {
      // insert user id into festival guest array
      await db.transaction(async (trx) => {
        const db_guest = await trx("festivals")
          .where({ festival_id: festival_id })
          .update({
            festival_user_guest_id: trx.raw(
              "array_append(festival_user_guest_id, ?)",
              [user_id]
            ),
          })
          .returning("*");

        if (!db_guest) {
          return { success: false, details: "Inserting new guest failed." };
        }

        // get festival passport using festival id
        var festival_passport = await db("festivals")
          .select("basic_passport_id")
          .where({ festival_id })
          .then((resp) => {
            return resp;
          });

        // create new business passport
        const db_passport = await trx("passport_details")
          .insert({
            passport_user_id: user_id,
            passport_festival_id: festival_id,
            passport_id: festival_passport[0].basic_passport_id,
            passport_type: "BASIC",
          })
          .returning("*");

        if (!db_passport) {
          return { success: false, details: "Inserting passport failed." };
        }
      });

      return { success: true, details: "Success." };
    }
  } catch (error) {
    return { success: false, details: error };
  }
};

const validatePromoCode = async (festival_id, promo_code) => {
  const festival_promo_code = await db("festivals")
    .select("promo_code")
    .where("festival_id", festival_id);
  return festival_promo_code === promo_code;
};




module.exports = {
  getAllFestivals,
  getAllFestivalList,
  getThreeFestivals,
  getFestivalList,
  getFestivalListNoFuture,
  createNewFestival,
  hostToFestival,
  addVendorApplication,
  addSponsorApplication,
  sponsorToFestival,
  getFestivalDetails,
  getFestivalRestaurants,
  getAllFestivalsPresent,
  updateFestival,
  addBusinessToFestival,
  getAllHostFestivalList,
  addRestaurantApplication,
  attendFestival,
  removeAttendance,
  addNeighbourhoodSponsor,
  getFestivalByPassport,
  getFestivalByPassports,
  registerUserToFestivals,
  getFestivalDetailsBySlug,
  validatePromoCode,
};
