"use strict";

// Libraries
const { db } = require("../../db/db-config");
const { formatTime } = require("../../functions/functions");

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
      return { success: true, festival_list: value };
    })
    .catch((reason) => {
      return { success: false, data: reason };
    });
};

/* Save new festival to festivals and festival images tables helper 
function */
const createNewFestival = async (festival_details, festival_images) => {
  try {
    await db.transaction(async (trx) => {
      const db_festival = await trx("festivals")
        .insert(festival_details)
        .returning("*");

      if (!db_festival) {
        return { success: false, details: "Inserting new festival failed." };
      }

      const images = festival_images.map((festival_image_url) => ({
        festival_id: db_festival[0].festival_id,
        festival_image_url,
      }));

      await trx("festival_images").insert(images);
    });

    return { success: true, details: "Success." };
  } catch (error) {
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
              if (db_user.role.includes("HOST") && applicationType === "Host")
            {   
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
            } 
            else if (db_user.role.includes("VENDOR") || db_user.role.includes("BUSINESS_MEMBER") || db_user.role.includes("BUSINESS_MEMBER_PENDING") && applicationType === "Vendor") 
            // && !db_user.role.includes("HOST") && !db_user.role.includes("HOST_PENDING"))
            {

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

              if (!db_user.role.includes("VENDOR"))
              {
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
          console.log("festival_id coming from host to festival:", typeof foodSamplePreference)

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
            if (db_user.role.includes("VENDOR") || db_user.role.includes("BUSINESS_MEMBER") || db_user.role.includes("BUSINESS_MEMBER_PENDING") && applicationType === "Vendor") 
            {

              var vendor_application_ids = await db("festivals")
                .select("vendor_request_id")
                .where("festival_id", "=", item)
                .then((resp) => {
                  return resp;
                });

              var vendor_ids_array = vendor_application_ids[0].vendor_request_id || [];
              if (!vendor_ids_array.includes(db_user.tasttlig_user_id)) {
                vendor_ids_array.push(db_user.tasttlig_user_id);
                await db("festivals")
                  .where({ festival_id: item })
                  .update({ vendor_request_id: vendor_ids_array });
              }

              if (!db_user.role.includes("VENDOR") && !db_user.role.includes("VENDOR_PENDING"))
              {
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
          console.log("festival_id coming from host to festival:", typeof foodSamplePreference)

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


            var vendor_ids_array = vendor_application_ids[0].vendor_request_id || [];
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

const addSponsorApplication = async (
  festival_id,
  db_user,
  applicationType
) => {

  try {
    await db.transaction(async (trx) => {
      if (typeof festival_id === "object") {
        for (let item of festival_id) {
            try {
            if (db_user.role.includes("SPONSOR") || db_user.role.includes("SPONSOR_PENDING") || applicationType === "Sponsor") 
            {

              var sponsor_application_ids = await db("festivals")
                .select("sponsor_request_id")
                .where("festival_id", "=", item)
                .then((resp) => {
                  return resp;
                });
                
              var sponsor_ids_array = sponsor_application_ids[0].sponsor_request_id || [];
              if (!sponsor_ids_array.includes(db_user.tasttlig_user_id)) {
                sponsor_ids_array.push(db_user.tasttlig_user_id);
                await db("festivals")
                  .where({ festival_id: item })
                  .update({ sponsor_request_id: sponsor_ids_array });
              }

              if (!db_user.role.includes("SPONSOR"))
              {
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

            var sponsor_ids_array = sponsor_application_ids[0].sponsor_request_id || [];
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

// create partner application
const addPartnerApplication = async (
  festival_id,
  db_user
) => {

  try {
    await db.transaction(async (trx) => {


      try {
        for (let festival of festival_id) {
          const db_festival = await getFestivalDetails(
            festival
            )
            
            await trx("applications").insert({
              user_id: db_user.tasttlig_user_id,
              created_at: new Date(),
              updated_at: new Date(),
              receiver_id: db_festival.details[0].festival_host_admin_id[0],
              reason: "partner application",
              type: "partner",
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
  }
};

const updateFestival = async (data, festival_images) => {
  try {
    await db.transaction(async (trx) => {
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
        })
        .returning("*");

      await trx("festival_images")
        .where({ festival_id: data.festival_id })
        .update({ festival_image_url: festival_images[0] })
        .returning("*");
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Add sponsor to festivals table helper function
const sponsorToFestival = async (festival_id, festival_business_sponsor_id, db_user) => {
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
        if(!role.includes('SPONSOR'))
        {
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
const getFestivalDetails = async (festival_id) => {
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
      return {
        success: true,
        details: value,
      };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
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

module.exports = {
  getAllFestivals,
  getAllFestivalList,
  getThreeFestivals,
  getFestivalList,
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
  addPartnerApplication,
  removeAttendance,
};
