"use strict";

// Libraries
const { db } = require("../../db/db-config");
const _ = require("lodash");

// Get all applications helper function
const getHostApplications = async () => {
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
      .having("applications.status", "=", "Pending");

    return {
      success: true,
      applications,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get specific application helper function
const getHostApplication = async (userId) => {
  try {
    let application = await db
      .select(
        "tasttlig_users.*",
        "business_details.*",
        "sponsors.*",
        "hosts.*",
        "food_samples.*",
        "payment_info.*",
        "business_details_images.*",
        "food_sample_images.image_url",
        db.raw("ARRAY_AGG(roles.role) as role")
      )
      .from("tasttlig_users")
      .leftJoin(
        "business_details",
        "tasttlig_users.tasttlig_user_id",
        "business_details.business_details_user_id"
      )
      .leftJoin(
        "hosts",
        "tasttlig_users.tasttlig_user_id",
        "hosts.host_user_id"
      )
      .leftJoin(
        "food_samples",
        "tasttlig_users.tasttlig_user_id",
        "food_samples.food_sample_creater_user_id"
      )
      .leftJoin(
        "business_details_images",
        "business_details.business_details_id",
        "business_details_images.business_details_id"
      )
      .leftJoin(
        "sponsors",
        "tasttlig_users.tasttlig_user_id",
        "sponsors.sponsor_user_id"
      )
      .leftJoin(
        "payment_info",
        "tasttlig_users.tasttlig_user_id",
        "payment_info.user_id"
      )
      .leftJoin(
        "user_role_lookup",
        "tasttlig_users.tasttlig_user_id",
        "user_role_lookup.user_id"
      )
      .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
      .leftJoin("food_sample_images", "food_samples.food_sample_id", "food_sample_images.food_sample_id")
      .groupBy("food_sample_images.food_sample_image_id")
      .groupBy("food_samples.food_sample_id")
      .groupBy("hosts.host_id")
      .groupBy("business_details_images.business_details_image_id")
      .groupBy("tasttlig_users.tasttlig_user_id")
      .groupBy("business_details.business_details_id")
      .groupBy("sponsors.sponsor_id")
      .groupBy("payment_info.payment_bank_id")
      .having("tasttlig_users.tasttlig_user_id", "=", userId)
      .first();

    const reviews = await db
      .select("*")
      .from("external_review")
      .where("external_review.user_id", "=", userId);

    reviews.forEach((r) => {
      if (r.text) {
        application.personal_review = r.text;
      } else {
        application[`${r.platform}_review`] = r.link;
      }
    });

    const documents = await db
      .select("*")
      .from("documents")
      .where("documents.user_id", "=", userId);

    const services = await db
      .select(db.raw("ARRAY_AGG(business_services.name) as names"))
      .from("business_services")
      .where("business_services.user_id", "=", userId);

    const menuItems = await db
      .select(
        "menu_items.*",
        db.raw("ARRAY_AGG(menu_item_images.image_url) as image_urls")
      )
      .from("menu_items")
      .where("menu_items.menu_item_creator_user_id", userId)
      .leftJoin(
        "menu_item_images",
        "menu_items.menu_item_id",
        "menu_item_images.menu_item_id"
      )
      .groupBy("menu_items.menu_item_id");

    application.reviews = _.groupBy(reviews, "platform");
    application.documents = documents;
    application.menu_items = menuItems;
    application.services = services && services.length ? services[0].names : [];

    const applications = await db
      .select("*")
      .from("applications")
      .where("applications.user_id", "=", userId);

    application.videos = [];

    applications.forEach((a) => {
      if (a.type === "host") {
        application = {
          ...application,
          is_host: "yes",
          host_selection: a.reason,
          host_selection_resume: a.resume,
          host_selection_video: a.video_link,
          host_youtube_link: a.youtube_link,
        };
        application.videos.push(a.video_link);
      } else if (a.type === "cook") {
        application = {
          ...application,
          is_cook: "yes",
          cook_selection: a.reason,
          cook_selection_resume: a.resume,
          cook_selection_video: a.video_link,
          cook_youtube_link: a.youtube_link,
        };
        application.videos.push(a.video_link);
      }
    });

    return {
      success: true,
      application,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const saveApplicationInformation = async (hostDto, is_host, trx) => {
  console.log("is_host", is_host)
  let applications = [];
  let role_name = "";

console.log('hello')
  if (is_host === "yes") {
    console.log("im in is_host", is_host)
    applications.push({
      user_id: hostDto.host_user_id,
      video_link: hostDto.host_video_url,
      // youtube_link: hostDto.host_youtube_link,
      reason: hostDto.host_description,
      // resume: hostDto.host_selection_resume,
      created_at: new Date(),
      updated_at: new Date(),
      type: "host",
      status: "Pending",
    });
    role_name = "HOST_PENDING";
  }
  console.log("role name",  role_name);

  // Save sponsor application to applications table
  // if (applications.length == 0 && hostDto.is_sponsor) {
  //   applications.push({
  //     user_id: hostDto.dbUser.user.tasttlig_user_id,
  //     reason: "",
  //     created_at: new Date(),
  //     updated_at: new Date(),
  //     type: "sponsor",
  //     status: "Pending",
  //   });
  //   role_name = "SPONSOR_PENDING";
  // }

/*    if (applications.length == 0 && hostDto.is_host === "no") {
    applications.push({
       user_id: hostDto.dbUser.user.tasttlig_user_id,
       reason: "",
     created_at: new Date(),
       updated_at: new Date(),
       type: "vendor",
       status: "Pending",
     });
     role_name = "VENDOR_PENDING";
   } */

  // Get role code of new role to be added
  const new_role_code = await trx("roles")
    .select()
    .where({ role: role_name })
    .then((value) => {
      return value[0].role_code;
    });
    console.log("new role: ", new_role_code)

  // Insert new role for this user
  await trx("user_role_lookup").insert({
    user_id: hostDto.host_user_id,
    role_code: new_role_code,
  });
  console.log("applications:", applications)

  return trx("applications")
    .insert(applications)
    .returning("*")
    .catch((reason) => {
      console.log(reason);
    });
};


const createHost = async (host_details, is_host) => {
  try {
    await db.transaction(async (trx) => {
      await  saveApplicationInformation(host_details, is_host, trx);
      const db_preference = await trx("hosts")
        .insert(host_details)
        .returning("*");

      if (!db_preference) {
        return { success: false, details: "Inserting new preference failed." };
      }

    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};


module.exports = {
  getHostApplications,
  getHostApplication,
  createHost
};
