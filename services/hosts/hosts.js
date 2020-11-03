"use strict";

const {db} = require("../../db/db-config");
const _ = require("lodash");

const getHostApplications = async () => {
  try {
    const applications = await db
      .select("*")
      .from("tasttlig_users")
      .innerJoin("business_details", "tasttlig_users.tasttlig_user_id", "business_details.user_id")
      .where("tasttlig_users.role", "like", "%HOST_PENDING%");
    return {
      success: true,
      applications
    }
  } catch (e) {
    return {success: false, error: e.message}
  }
}

const getHostApplication = async (userId) => {
  try {
    let application = await db
      .select("*")
      .from("tasttlig_users")
      .innerJoin("business_details", "tasttlig_users.tasttlig_user_id", "business_details.user_id")
      .innerJoin("payment_info", "tasttlig_users.tasttlig_user_id", "payment_info.user_id")
      .where("tasttlig_users.role", "like", "%HOST_PENDING%")
      .where("tasttlig_users.tasttlig_user_id", "=", userId)
      .first();

    const reviews = await db.select("*")
      .from("external_review")
      .where("external_review.user_id", "=", userId);

    reviews.forEach(r => {
      if (r.text) {
        application.personal_review = r.text;
      } else {
        application[`${r.platform}_review`] = r.link;
      }
    })

    const documents = await db.select("*")
      .from("documents")
      .where("documents.user_id", "=", userId);

    const services = await db.select(db.raw("ARRAY_AGG(business_services.name) as names"))
      .from("business_services")
      .where("business_services.user_id", "=", userId);

    const menuItems = await db.select(
      "menu_items.*",
      db.raw("ARRAY_AGG(menu_item_images.image_url) as image_urls"),
    )
      .from("menu_items")
      .where("menu_items.menu_item_creator_user_id", userId)
      .leftJoin(
        "menu_item_images",
        "menu_items.menu_item_id",
        "menu_item_images.menu_item_id"
      )
      .groupBy("menu_items.menu_item_id")

    application.reviews = _.groupBy(reviews, "platform");
    application.documents = documents;
    application.menu_items = menuItems;
    application.services = services && services.length ? services[0].names : [];

    const applications = await db.select("*")
      .from("applications")
      .where("applications.user_id", "=", userId);

    application.videos = [];

    applications.forEach(a => {
      if (a.type === "host") {
        application = {
          ...application,
          is_host: "yes",
          host_selection: a.reason,
          host_selection_resume: a.resume,
          host_selection_video: a.video_link,
          host_youtube_link: a.youtube_link
        }
        application.videos.push(a.video_link)
      } else if (a.type === "cook") {
        application = {
          ...application,
          is_cook: "yes",
          cook_selection: a.reason,
          cook_selection_resume: a.resume,
          cook_selection_video: a.video_link,
          cook_youtube_link: a.youtube_link
        }
        application.videos.push(a.video_link)
      }
    })

    return {
      success: true,
      application
    }
  } catch (e) {
    return {success: false, error: e.message}
  }
}

module.exports = {
  getHostApplications,
  getHostApplication
}