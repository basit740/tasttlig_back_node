"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

// Create service helper function
const createNewService = async (
  user_details_from_db,
  service_information,
  service_images
) => {
  try {
    service_information.claimed_total_quantity = 0;
    await db.transaction(async (trx) => {
      const db_service = await trx("services")
        .insert(service_information)
        .returning("*");

      if (!db_service) {
        return { success: false, details: "Inserting new service failed." };
      }

      const images = service_images.map((service_image) => ({
        service_id: db_service[0].service_id,
        service_image_url: service_image,
      }));

      await trx("service_images").insert(images);

      console.log('FESTIVAL SELECTED', service_information.festivals_selected);
      console.log('USER DETAILS', user_details_from_db.user.role);

      if(service_information.festivals_selected>0)
      {  
        
        if (user_details_from_db.user.role && user_details_from_db.user.role.includes("HOST")) 
        {
            await trx("festivals")
            .where({ festival_id: service_information.festivals_selected[0] })
            .update({
              festival_host_id: trx.raw("array_append(festival_host_id, ?)", [
                user_details_from_db.user.tasttlig_user_id,
              ]),
            })
          }
          else if (user_details_from_db.user.role && user_details_from_db.user.role.includes("VENDOR")) 
          {
            // console.log('VENDOR FESTIVAL LENGHT', experience_details.festival_selected );
            // console.log('USER ROLEEEEEEEE', user_role_object );
              await trx("festivals")
              .where({ festival_id: service_information.festivals_selected[0] })
              .update({
                festival_vendor_id: trx.raw("array_append(festival_vendor_id, ?)", [
                  user_details_from_db.user.tasttlig_user_id,
                ]),
              })
          }
      }

      // Food sample created confirmation email
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: user_details_from_db.user.email,
        bcc: ADMIN_EMAIL,
        subject: `[Tasttlig] New Service Created`,
        template: "new_food_sample",
        context: {
          title: service_information.service_name,
          status: service_information.service_status,
        },
      });
    });

    return { success: true, details: "Success." };
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }
};

const addServiceToFestival = async (festival_id, service_id, service_user_id, user_details_from_db) => {
  try {
    await db.transaction(async (trx) => {
      console.log("serviceId", service_id);
      if (Array.isArray(service_id)) {
        for (let service of service_id) {
          const db_service = await trx("services")
            .where({ service_id: service })
            .update({
              festivals_selected: trx.raw(
                "array_append(festivals_selected, ?)",
                [festival_id]
              ),
            })
            .returning("*");

          if (!db_service) {
            return {
              success: false,
              details: "Inserting new product guest failed.",
            };
          }
        }
        // await trx("festivals")
        // .where({ festival_id: festival_id })
        // .update({
        //   festival_host_id: trx.raw("array_append(festival_host_id, ?)", [
        //     service_user_id,
        //   ]),
        // })
        if (user_details_from_db.user.role.includes("HOST")) 
        {
            await trx("festivals")
            .where({ festival_id: festival_id })
            .update({
              festival_host_id: trx.raw("array_append(festival_host_id, ?)", [
                service_user_id,
              ]),
            })
          }
          else if (user_details_from_db.user.role.includes("VENDOR")) 
          {
              await trx("festivals")
              .where({ festival_id: festival_id })
              .update({
                festival_vendor_id: trx.raw("array_append(festival_vendor_id, ?)", [
                  service_user_id,
                ]),
              })
          }
      } else {
        let query = await db
          .select("services.*")
          .from("services")
          .where("service_id", "=", service_id);
        console.log(query);
        if (query[0].service_festival_id) {
          const db_service = await trx("services")
            .where({ service_id })
            .update({
              festivals_selected: trx.raw(
                "array_append(service_festivals_selected, ?)",
                [festival_id]
              ),
            })
            .returning("*");
            if (user_details_from_db.user.role.includes("HOST")) 
           {
            await trx("festivals")
            .where({ festival_id: festival_id })
            .update({
              festival_host_id: trx.raw("array_append(festival_host_id, ?)", [
                service_user_id,
              ]),
            })
          }
          else if (user_details_from_db.user.role.includes("VENDOR")) 
          {
              await trx("festivals")
              .where({ festival_id: festival_id })
              .update({
                festival_vendor_id: trx.raw("array_append(festival_vendor_id, ?)", [
                  service_user_id,
                ]),
              })
          }
            // await trx("festivals")
            // .where({ festival_id: festival_id })
            // .update({
            //   festival_host_id: trx.raw("array_append(festival_host_id, ?)", [
            //     service_user_id,
            //   ]),
            // })

          if (!db_service) {
            return {
              success: false,
              details: "Inserting new product guest failed.",
            };
          }
        } else {
          const db_service = await trx("services")
            .where({ service_id })
            .update({
              festivals_selected: [festival_id],
            })
            .returning("*");

          if (!db_service) {
            return {
              success: false,
              details: "Inserting new product guest failed.",
            };
          }
        }
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }
};

// Get services in festival helper function
const getServicesInFestival = async (festival_id, filters, keyword) => {
  let query = db
    .select(
      "services.*",
      "business_details.*",
      // "business_details.business_address_1",
      // "business_details.business_address_2",
      "business_details.city",
      "business_details.state",
      "business_details.zip_postal_code",
      db.raw("ARRAY_AGG(service_images.service_image_url) as image_urls")
    )
    .from("services")
    .leftJoin(
      "service_images",
      "services.service_id",
      "service_images.service_id"
    )
    .join(
      "festivals",
      "services.festivals_selected[1]",
      "festivals.festival_id"
    )
    .leftJoin(
      "business_details",
      "services.service_user_id",
      "business_details.business_details_user_id"
    )
    .groupBy("services.service_id")
    .groupBy("business_details.business_details_id")
    // .groupBy("business_details.business_address_1")
    // .groupBy("business_details.business_address_2")
    .groupBy("business_details.city")
    .groupBy("business_details.state")
    .groupBy("business_details.zip_postal_code")
    .having("services.festivals_selected", "@>", [festival_id]);

  let orderByArray = [];
  if (filters.price) {
    if (filters.price === "lowest_to_highest") {
      orderByArray.push({ column: "services.service_price", order: "asc" });
      //query.orderBy("products.product_price", "asc")
    } else if (filters.price === "highest_to_lowest") {
      orderByArray.push({ column: "services.service_price", order: "desc" });
      //query.orderBy("services.service_price", "desc")
    }
  }
  if (filters.quantity) {
    if (filters.quantity === "lowest_to_highest") {
      orderByArray.push({ column: "services.service_capacity", order: "asc" });
    } else if (filters.quantity === "highest_to_lowest") {
      orderByArray.push({ column: "services.service_capacity", order: "desc" });
    }
  }

  if (filters.price || filters.quantity) {
    query.orderBy(orderByArray);
  }
  if (filters.size) {
    if (filters.size === "bite_size") {
      query.having("services.service_size_scope", "=", "Bite Size");
    } else if (filters.size === "quarter") {
      query.having("services.service_size_scope", "=", "Quarter");
    } else if (filters.size === "half") {
      query.having("services.service_size_scope", "=", "Half");
    } else if (filters.size === "full") {
      query.having("services.service_size_scope", "=", "Full");
    }
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
                //"main.business_name, " +
                //"main.business_city, " +
                "main.service_name, " +
                "main.service_capacity, " +
                "main.service_price, " +
                "main.service_size_scope, " +
                "main.service_description)) as search_text"
            )
          )
          .from(query.as("main"))
          .as("main")
      )
      .orderBy("rank", "desc");
  }
  return await query
    .then((value) => {
      // console.log(value);
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log(reason);
      return { success: false, details: reason };
    });
};

//service details for dashboard
const getUserServiceDetails = async (user_id, keyword) => {
  // return await db
  let query = db
    .select(
      "services.*",
      db.raw("ARRAY_AGG(service_images.service_image_url) as image_urls"),
      "nationalities.country",
      "business_details.*"
    )
    .from("service_images")
    .rightJoin("services", "service_images.service_id", "services.service_id")
    .leftJoin(
      "nationalities",
      "services.service_nationality_id",
      "nationalities.id"
    )
    .leftJoin(
        "business_details",
        "services.service_user_id",
        "business_details.business_details_user_id"
      )
    .groupBy("services.service_id")
    .groupBy("services.service_nationality_id")
    .groupBy("business_details.business_details_id")
    .groupBy("nationalities.id")
    .having("services.service_user_id", "=", Number(user_id));

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
                "main.service_name, " +
                "main.service_price, " +
                "main.service_description, " +
                "main.additional_information, " +
                "main.service_type, " +
                "main.service_code)) as search_text"
            )
          )
          .from(query.as("main"))
          .as("main")
      )
      .orderBy("rank", "desc");
  }

  return await query
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

const getServicesFromUser = async (user_id, keyword, festival_id) => {
  console.log('user of this service', user_id);
  let query = db
    .select(
      "services.*",
      "business_details.business_name",
      // "business_details.business_address_1",
      // "business_details.business_address_2",
      "business_details.city",
      "business_details.state",
      "business_details.zip_postal_code",
      "nationalities.nationality",
      db.raw("ARRAY_AGG(service_images.service_image_url) as image_urls")
    )
    .from("services")
    .leftJoin(
      "service_images",
      "services.service_id",
      "service_images.service_id"
    )
    .leftJoin(
      "business_details",
      "services.service_business_id",
      "business_details.business_details_id"
    )
    .leftJoin(
      "nationalities",
      "services.service_nationality_id",
      "nationalities.id"
    )
    .leftJoin(
      "festivals",
      "services.festivals_selected[1]",
      "festivals.festival_id"
    )
    .groupBy("services.service_id")
    .groupBy("festivals.festival_id")
    .groupBy("business_details.business_name")
    // .groupBy("business_details.business_address_1")
    // .groupBy("business_details.business_address_2")
    .groupBy("business_details.city")
    .groupBy("business_details.state")
    .groupBy("business_details.zip_postal_code")
    .groupBy("business_details.business_details_user_id")
    .groupBy("nationalities.nationality")
    .groupBy("services.festivals_selected")
    //.having("business_details.business_details_user_id", "=", Number(user_id));
    .having("services.service_user_id", "=", Number(user_id));

  if (festival_id) {
    //console.log("hello from festivalid", festival_id);
    query = query.havingRaw(
      "(? != ALL(coalesce(services.festivals_selected, array[]::int[])))",
      festival_id
    );
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
                //"main.business_name, " +
                "main.service_name, " +
                "main.service_capacity, " +
                "main.service_price, " +
                //"main.business_city, " +
                "main.service_description)) as search_text"
            )
          )
          .from(query.as("main"))
          .as("main")
      )
      .orderBy("rank", "desc");
  }
  return await query
    .then((value) => {
      console.log("serviceValue", value.data);
      return { success: true, details: value };
    })
    .catch((reason) => {
      //console.log(reason);
      return { success: false, details: reason };
    });
};
// Find service helper function
const findService = async (service_id) => {
  return await db
    .select("services.*")
    .from("services")
    .where("services.service_id", "=", service_id)
    .first()
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

const deleteServicesFromUser = async (user_id, delete_items) => {
  try {
    for (let item of delete_items) {
      await db.transaction(async (trx) => {
        const serviceImagesDelete = await trx("service_images")
          .where({
            service_id: item.service_id,
          })
          .del();
        const serviceDelete = await trx("services")
          .where({
            service_id: item.service_id,
          })
          .del()
          .then(() => {
            return { success: true };
          })
          .catch((reason) => {
            return { success: false, details: reason };
          });
      });
    }
  } catch (error) {
    return { success: false, details: error };
  }
};

// Claim service helper function
const claimService = async (db_user, service_id) => {
  try {
    await db.transaction(async (trx) => {
      const db_service = await trx("services")
        .where({ service_id })
        .update({
          service_user_guest_id: trx.raw(
            "array_append(service_user_guest_id, ?)",
            [db_user.tasttlig_user_id]
          ),
        })
        .returning("*");

      if (!db_service) {
        return {
          success: false,
          details: "Inserting new service guest failed.",
        };
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};
// Update service helper function
const updateService = async (db_user, data) => {
  const { service_images, ...service_update_data } = data;
  service_update_data.service_user_id = db_user.tasttlig_user_id
 
 if(service_update_data.service_festivals_id === '') {
  service_update_data.service_festivals_id = [];
 } 

  let updateData = {};
  // console.log('SERVICE UPDATE DATA', service_update_data );
  // updateData.service_user_id = db_user.tasttlig_user_id;
  if(service_update_data.service_festivals_id==='')
  { 
    service_update_data.service_festivals_id = [];
  }
  
  updateData.service_festivals_id = data.service_festival_id;

  try {
    if (Array.isArray(data.service_id)) {
      await db("services")
        .whereIn("service_id", data.service_id)
        .where((builder) => {
          return builder.where({
            /* service_id, */
            service_user_id: db_user.tasttlig_user_id,
          });
        })
        .update(updateData);

        // for each festival
        updateData.service_festivals_id.map(async (festival_id) => {
          try {
            if (db_user.role.includes("HOST"))
          {   
            var host_ids = await db("festivals")
            .select("festival_host_id")
            .where("festival_id", "=", festival_id)
            .then( (resp) => {return resp})

            // console.log('hosts to add ', host_ids)

            if(!host_ids.includes(db_user.tasttlig_user_id)) {
              host_ids.push(db_user.tasttlig_user_id);
              await db("festivals")
              .where({"festival_id": festival_id})
              .update({"festival_host_id": host_ids}) 
            }
          } 
          else if (db_user.role.includes("VENDOR"))
          {
            var vendor_ids = await db("festivals")
            .select("festival_vendor_id")
            .where("festival_id", "=", festival_id)
            .then( (resp) => {return resp})

            // console.log('vendors to add ', vendor_ids);

            var vendor_ids_array = vendor_ids[0].festival_vendor_id || [];
            // console.log('VENDOR array ', vendor_ids_array);
            if(!vendor_ids_array.includes(db_user.tasttlig_user_id)) {
              vendor_ids_array.push(db_user.tasttlig_user_id);
              await db("festivals")
              .where({"festival_id": festival_id})
              .update({"festival_vendor_id": vendor_ids_array})
            }
          }
          } catch (error) {
            return {success: false}
          }
          
        });
      return { success: true };
    } else {
      await db("services")
        .where((builder) => {
          return builder.where({
            service_id : data.service_id,
            service_user_id: db_user.tasttlig_user_id,
          });
        })
        .update(service_update_data);

      if (service_images && service_images.length) {
        await db("service_images").where("service_id", data.service_id).del();

        await db("service_images").insert(
          service_images.map((image_url) => ({
            service_id: data.service_id,
            service_image_url: image_url,
          }))
        );
      }

      // for each festival
      updateData.service_festivals_id.map(async (festival_id) => {
        try {
          if (db_user.role.includes("HOST"))
        {   
          var host_ids = await db("festivals")
          .select("festival_host_id")
          .where("festival_id", "=", festival_id)
          .then( (resp) => {return resp})

          // console.log('hosts to add ', host_ids)

          if(!host_ids.includes(db_user.tasttlig_user_id)) {
            host_ids.push(db_user.tasttlig_user_id);
            await db("festivals")
            .where({"festival_id": festival_id})
            .update({"festival_host_id": host_ids}) 
          }
        } 
        else if (db_user.role.includes("VENDOR"))
        {
          var vendor_ids = await db("festivals")
          .select("festival_vendor_id")
          .where("festival_id", "=", festival_id)
          .then( (resp) => {return resp})

          // console.log('vendors to add ', vendor_ids);

          var vendor_ids_array = vendor_ids[0].festival_vendor_id || [];
          // console.log('VENDOR array ', vendor_ids_array);
          if(!vendor_ids_array.includes(db_user.tasttlig_user_id)) {
            vendor_ids_array.push(db_user.tasttlig_user_id);
            await db("festivals")
            .where({"festival_id": festival_id})
            .update({"festival_vendor_id": vendor_ids_array})
          }
        }
        } catch (error) {
          return {success: false}
        }
        
      });

      return { success: true };
    }
  } catch (error) {
    console.log('service update error', error);
    return { success: false, details: error };
  }
};

// Delete service helper function
const deleteService = async (user_id, service_id) => {
  if (Array.isArray(service_id)) {
    return await db("service_images")
      .whereIn("service_id", service_id)
      .del()
      .then(async () => {
        await db("services")
          .where({
            /* service_id, */
            service_user_id: user_id,
          })
          .whereIn("service_id", service_id)
          .del();
        return { success: true };
      })
      .catch((reason) => {
        return { success: false, details: reason };
      });
  } else {
    return await db("service_images")
      .where({
        service_id,
      })
      .del()
      .then(async () => {
        await db("services")
          .where({
            service_id,
            service_user_id: user_id,
          })
          .del();
        return { success: true };
      })
      .catch((reason) => {
        return { success: false, details: reason };
      });
  }
};

module.exports = {
  createNewService,
  getServicesInFestival,
  addServiceToFestival,
  getUserServiceDetails,
  getServicesFromUser,
  findService,
  deleteServicesFromUser,
  claimService,
  updateService,
  deleteService,
};
