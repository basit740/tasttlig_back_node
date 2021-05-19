"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer =
  require("../../services/email/nodemailer").nodemailer_transporter;
const jwt = require("jsonwebtoken");
const user_profile_service = require("../../services/profile/user_profile");
const festival_service = require("../../services/festival/festival");
const {
  formatDate,
  formatMilitaryToStandardTime,
  formatTime,
} = require("../../functions/functions");
// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

const userCanClaimService = async (email, food_sample_id) => {
  try {
    const { user } = await user_profile_service.getUserByEmailWithSubscription(
      email
    );

    const claimIds = await db
      .pluck("claimed_service_id")
      .from("user_claims")
      .where("user_claim_email", email)
      .where("claimed_service_id", food_sample_id);

    if (claimIds.length) {
      if (user == null && claimIds.length > 3) {
        return {
          success: true,
          canClaim: false,
          message: "Maximum number of claims reached.",
        };
      } else if (
        (user == null || user.subscription_code.endsWith("_S")) &&
        claimIds.includes(food_sample_id)
      ) {
        return {
          success: true,
          canClaim: false,
          message: "Service has already been claimed.",
        };
      }
    }

    return { success: true, canClaim: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const findService = async (service_id) => {
  return await db
    .select("services.*", "business_details.*", "tasttlig_users.*")
    .from("services")
    .leftJoin(
      "business_details",
      "services.service_business_id",
      "business_details.business_details_id"
    )
    .leftJoin(
      "tasttlig_users",
      "business_details.business_details_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .groupBy("services.service_id")
    .groupBy("business_details.business_details_id")
    .groupBy("business_details.business_details_user_id")
    .groupBy("tasttlig_users.tasttlig_user_id")
    .having("services.service_id", "=", service_id)
    .first()
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

const createNewServiceClaim = async (
  db_user,
  db_all_products,
  quantityAfterClaim,
  product_claim_details
) => {
  try {
    await db.transaction(async (trx) => {
      const db_food_sample_claim = await trx("user_claims")
        .insert(product_claim_details)
        .returning("*");

      if (!db_food_sample_claim) {
        return {
          success: false,
          details: "Inserting new food sample claim failed.",
        };
      }

      if (quantityAfterClaim >= 0) {
        await db("services")
          .where({
            service_id: db_food_sample_claim[0].claimed_service_id,
          })
          .update({ claimed_total_quantity: quantityAfterClaim });
      }

      await sendClaimedServiceEmailToUser(
        db_user,
        db_all_products,
        db_food_sample_claim[0]
      );

      await sendClaimedServiceEmailToProvider(
        db_user,
        db_all_products,
        db_food_sample_claim[0]
      );

      //assign festival end-date and festival to guest subscription package after product claim
      const subs = await user_profile_service.getValidSubscriptionsByUserId(
        product_claim_details.claim_user_id
      );

      const response = await festival_service.getFestivalDetails(
        product_claim_details.festival_id
      );
      const getFestivalEndDate = response.details[0].festival_end_date;
      ("subs", subs);
      subs &&
        subs.user.map((sub) => {
          if (
            sub.subscription_code === "G_BASIC" ||
            sub.subscription_code === "G_MSHIP1" ||
            sub.subscription_code === "G_MSHIP2" ||
            sub.subscription_code === "G_MSHIP3" ||
            (sub.subscription_code === "G_AMB" &&
              sub.suscribed_festivals == null)
          ) {
            /* let subscription_end_datetime = null;
              subscription_end_datetime = new Date(
                new Date().setMonth(new Date().getMonth() + Number(1))
              );
              console.log("sub date", subscription_end_datetime); */

            const updateSub = async (subId, subDate, festivalId) => {
              await db("user_subscriptions")
                .where({
                  user_subscription_id: subId,
                  user_subscription_status: "ACTIVE",
                })
                .update({
                  subscription_end_datetime: subDate,
                  suscribed_festivals: [festivalId],
                })
                .returning("*")
                .catch((reason) => {
                  return { success: false, message: reason };
                });
            };

            updateSub(
              sub.user_subscription_id,
              getFestivalEndDate,
              product_claim_details.festival_id
            );
          }
        });
      //assign festival end-date and festival to guest subscription package after product claim ended
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

const sendClaimedServiceEmailToUser = async (
  db_user,
  db_food_sample,
  db_food_sample_claim
) => {
  const token = jwt.sign(
    {
      claim_id: db_food_sample_claim.claim_id,
      service_id: db_food_sample.service_id,
      db_user: {
        email: db_user.email,
        first_name: db_user.first_name,
        last_name: db_user.last_name,
      },
    },
    process.env.EMAIL_SECRET
  );

  const url = `${process.env.SITE_BASE}/confirm-food-sample/${token}`;

  return Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: db_user.email,
    bcc: ADMIN_EMAIL,
    subject: `[Tasttlig] You have claimed ${db_food_sample.service_name}`,
    template: "new_food_sample_claim",
    context: {
      first_name: db_user.first_name === "NA" ? "" : db_user.first_name,
      host_first_name: db_food_sample.first_name,
      title: db_food_sample.service_name,
      business_name: db_food_sample.business_name,
      address: db_food_sample.address,
      city: db_food_sample.city,
      state: db_food_sample.state,
      postal_code: db_food_sample.postal_code,
      start_date: db_food_sample.start_date
        ? formatDate(db_food_sample.start_date)
        : null,
      end_date: db_food_sample.end_date
        ? formatDate(db_food_sample.end_date)
        : null,
      start_time: db_food_sample.start_time
        ? formatMilitaryToStandardTime(db_food_sample.start_time)
        : null,
      end_time: db_food_sample.end_time
        ? formatMilitaryToStandardTime(db_food_sample.end_time)
        : null,
      description: db_food_sample.service_description,
      //frequency: db_food_sample.frequency,
      code: db_food_sample.service_code,
      url,
    },
  });
};

const sendClaimedServiceEmailToProvider = async (
  db_user,
  db_food_sample,
  db_food_sample_claim
) => {
  const token = jwt.sign(
    {
      claim_id: db_food_sample_claim.claim_id,
      food_sample_id: db_food_sample.service_id,
      db_user: {
        email: db_user.email,
        first_name: db_user.first_name,
        last_name: db_user.last_name,
      },
    },
    process.env.EMAIL_SECRET
  );

  const url = `${process.env.SITE_BASE}/confirm-food-sample/${token}`;

  return Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: db_food_sample.email,
    bcc: ADMIN_EMAIL,
    subject: `[Tasttlig] Service has been reserved - ${db_food_sample.service_name}`,
    template: "new_food_sample_reserved",
    context: {
      host_first_name: db_food_sample.first_name,
      first_name: db_user.first_name === "NA" ? "" : db_user.first_name,
      last_name: db_user.last_name === "NA" ? "" : db_user.last_name,
      email: db_user.email,
      title: db_food_sample.service_name,
      food_ad_code: db_food_sample.service_code,
      url,
    },
  });
};

const getUserApplications = async (user_id) => {
  try {
    const applications = await db
      .select("*")
      .from("applications")
      .where("applications.user_id", "=", user_id);
    return {
      success: true,
      applications,
    };
  } catch (error) {
    console.log("error", error);
    return { success: false, error: error.message };
  }
};

const getAttendedFestivalsForUser = async (
  currentPage,
  keyword,
  filters,
  user_id
) => {
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
    //.where("festivals.festival_id", ">", 3)
    //.where("festivals.festival_end_date", ">=", new Date())
    .groupBy("festivals.festival_id")
    .orderBy("festival_start_date");

  if (filters.nationalities && filters.nationalities.length) {
    query.whereIn("nationalities.nationality", filters.nationalities);
  }

  if (filters.startDate) {
    query.where("festivals.festival_start_date", "=", startDate);
  }

  if (filters.startTime) {
    query.where("festivals.festival_start_time", ">=", startTime);
  }

  if (filters.cityLocation) {
    query.where("festivals.festival_city", "=", filters.cityLocation);
  }

  if (user_id) {
    query.where("festivals.festival_user_guest_id", "@>", [user_id]);
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
      console.log(reason);
      return { success: false, details: reason };
    });
};

const getHostedFestivalsForUser = async (
  currentPage,
  keyword,
  filters,
  user_id
) => {
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
    //.where("festivals.festival_id", ">", 3)
    //.where("festivals.festival_end_date", ">=", new Date())
    .groupBy("festivals.festival_id")
    .orderBy("festival_start_date");

  if (filters.nationalities && filters.nationalities.length) {
    query.whereIn("nationalities.nationality", filters.nationalities);
  }

  if (filters.startDate) {
    query.where("festivals.festival_start_date", "=", startDate);
  }

  if (filters.startTime) {
    query.where("festivals.festival_start_time", ">=", startTime);
  }

  if (filters.cityLocation) {
    query.where("festivals.festival_city", "=", filters.cityLocation);
  }

  if (user_id) {
    query.where("festivals.festival_vendor_id", "@>", [user_id]);
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
      console.log(reason);
      return { success: false, details: reason };
    });
};

const getBusinessServiceRevenue = async (business_details_id) => {
  try {
    console.log("revenue biz id", business_details_id);

    const revenue = await db
      .select("order_items.*", "orders.*", "services.*", "user_claims.*")
      .from("orders")
      .rightJoin("order_items", "order_items.order_id", "orders.order_id")
      .leftJoin(
        db.raw(
          `services ON order_items.item_id = services.service_id::varchar 
        LEFT JOIN user_claims ON services.service_id = user_claims.claimed_service_id
        GROUP BY order_items.item_id, order_items.order_item_id, orders.order_id, 
        services.service_id, user_claims.claimed_service_id, user_claims.claim_id
        HAVING order_items.item_type = 'service' 
        AND services.service_business_id = ${business_details_id}`
        )
      );
    return {
      success: true,
      revenue,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getBusinessProductRevenue = async (business_details_id) => {
  try {
    console.log("revenue biz id", business_details_id);
    const revenue = await db
      .select("order_items.*", "orders.*", "products.*", "user_claims.*")
      .from("orders")
      .rightJoin("order_items", "order_items.order_id", "orders.order_id")
      .leftJoin(
        db.raw(
          `products ON order_items.item_id = products.product_id::varchar 
          LEFT JOIN user_claims ON products.product_id = user_claims.claimed_product_id
          GROUP BY order_items.item_id, order_items.order_item_id, orders.order_id, 
          products.product_id, user_claims.claimed_product_id, user_claims.claim_id
          HAVING order_items.item_type = 'product' 
          AND products.product_business_id = ${business_details_id}`
        )
      );
    return {
      success: true,
      revenue,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getBusinessExperienceRevenue = async (business_details_id) => {
  try {
    console.log("revenue biz id", business_details_id);

    const revenue = await db
      .select("order_items.*", "orders.*", "experiences.*", "user_claims.*")
      .from("orders")
      .rightJoin("order_items", "order_items.order_id", "orders.order_id")
      .leftJoin(
        db.raw(
          `experiences ON order_items.item_id = experiences.experience_id::varchar 
          LEFT JOIN user_claims ON experiences.experience_id = user_claims.claimed_experience_id
          GROUP BY order_items.item_id, order_items.order_item_id, orders.order_id, 
          experiences.experience_id, user_claims.claimed_experience_id, user_claims.claim_id
          HAVING order_items.item_type = 'experience' 
          AND experiences.experience_business_id = ${business_details_id}`
        )
      );
    return {
      success: true,
      revenue,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateProduct = async (db_user, data) => {
  delete data.user_id;
  const { product_images, ...product_update_data } = data;
  let updateData = {};
  updateData.festival_selected = data.festival_selected;

  try {
    if (Array.isArray(data.product_id)) {
      await db("products")
        .whereIn("product_id", data.product_id)
        .where((builder) => {
          return builder.where({
            product_user_id: db_user.user_id,
          });
        })
        .update(updateData);

      return { success: true };
    } else {
      await db("products")
        .where((builder) => {
          return builder.where({
            product_id: data.product_id,
            product_user_id: db_user.user_id,
          });
        })
        .update(product_update_data);

      if (product_images && product_images.length) {
        await db("product_images").where("product_id", data.product_id).del();

        await db("product_images").insert(
          product_images.map((image_url) => ({
            product_id: data.product_id,
            product_image_url: image_url,
          }))
        );
      }

      return { success: true };
    }
  } catch (error) {
    return { success: false, details: error };
  }
};

const updateService = async (db_user, data) => {
  delete data.user_id;
  const { service_images, ...service_update_data } = data;
  let updateData = {};
  updateData.festivals_selected = data.festival_selected;

  try {
    if (Array.isArray(data.service_id)) {
      await db("services")
        .whereIn("service_id", data.service_id)
        .where((builder) => {
          return builder.where({
            service_user_id: db_user.user_id,
          });
        })
        .update(updateData);

      return { success: true };
    } else {
      await db("services")
        .where((builder) => {
          return builder.where({
            service_id: data.service_id,
            service_user_id: db_user.user_id,
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

      return { success: true };
    }
  } catch (error) {
    return { success: false, details: error };
  }
};

const updateExperience = async (db_user, data) => {
  delete data.user_id;
  const { experience_images, ...experience_update_data } = data;
  let updateData = {};
  updateData.festival_selected = data.festival_selected;

  try {
    if (Array.isArray(data.experience_id)) {
      await db("experiences")
        .whereIn("experience_id", data.experience_id)
        .where((builder) => {
          return builder.where({
            experience_business_id: db_user.business_id,
          });
        })
        .update(updateData);

      return { success: true };
    } else {
      await db("experiences")
        .where((builder) => {
          return builder.where({
            experience_id: data.experience_id,
            experience_business_id: db_user.business_id,
          });
        })
        .update(experience_update_data);

      if (experience_images && experience_images.length) {
        await db("experience_images")
          .where("experience_id", data.experience_id)
          .del();

        await db("experience_images").insert(
          experience_images.map((image_url) => ({
            experience_id: data.experience_id,
            experience_image_url: image_url,
          }))
        );
      }

      return { success: true };
    }
  } catch (error) {
    return { success: false, details: error };
  }
};

const getAllUserOrders = async (user_id) => {
  let query = db
    .select(
      "orders.*",
      "order_items.*",
      "products.title",
      "services.service_name",
      "experiences.experience_name",
      "f1.festival_name AS product_festival",
      "f2.festival_name AS service_festival",
      "f3.festival_name AS experience_festival"
    )
    .from("order_items")
    .leftJoin("orders", "order_items.order_id", "orders.order_id")
    .leftJoin(
      "products",
      db.raw("CAST(order_items.item_id AS INT)"),
      "products.product_id"
    )
    .leftJoin(
      "services",
      db.raw("CAST(order_items.item_id AS INT)"),
      "services.service_id"
    )
    .leftJoin(
      "experiences",
      db.raw("CAST(order_items.item_id AS INT)"),
      "experiences.experience_id"
    )
    .leftJoin(
      "festivals AS f1",
      "products.festival_selected[1]",
      "f1.festival_id"
    )
    .leftJoin(
      "festivals AS f2",
      "services.festivals_selected[1]",
      "f2.festival_id"
    )
    .leftJoin(
      "festivals AS f3",
      "experiences.festival_selected[1]",
      "f3.festival_id"
    )
    .groupBy(
      "orders.*",
      "order_items.*",
      "orders.order_id",
      "order_items.order_id",
      "order_items.order_item_id",
      "products.product_id",
      "products.title",
      "products.festival_selected[1]",
      "services.service_id",
      "services.service_name",
      "services.festivals_selected[1]",
      "experiences.experience_id",
      "experiences.experience_name",
      "experiences.festival_selected[1]",
      "f1.festival_name",
      "f2.festival_name",
      "f3.festival_name",
      "f1.festival_id",
      "f2.festival_id",
      "f3.festival_id"
    )
    .where("orders.order_by_user_id", "=", user_id)
    .andWhere(function () {
      this.where("order_items.item_type", "product")
        .orWhere("order_items.item_type", "service")
        .orWhere("order_items.item_type", "experience")
        .orWhere("order_items.item_type", "festival");
      //.orWhere("order_items.subscription_code", "S_C3")
    });

  return await query
    .then((value) => {
      console.log(value);
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log(reason);
      return { success: false, details: reason };
    });
};

const getBusinessAwards = async (business_id) => {
  return db("awards")
    .select("awards.*")
    .where("business_id", business_id)
    .then((value) => {
      return { success: true, data: value };
    })
    .catch((reason) => {
      return { success: false, data: reason };
    });
};

module.exports = {
  userCanClaimService,
  findService,
  createNewServiceClaim,
  sendClaimedServiceEmailToProvider,
  sendClaimedServiceEmailToUser,
  getUserApplications,
  getAttendedFestivalsForUser,
  getHostedFestivalsForUser,
  getBusinessServiceRevenue,
  getBusinessExperienceRevenue,
  getBusinessProductRevenue,
  updateProduct,
  updateExperience,
  updateService,
  getAllUserOrders,
  getBusinessAwards,
};
