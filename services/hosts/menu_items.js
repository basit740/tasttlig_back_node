"use strict";

const {db, gis} = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const user_role_manager = require("../profile/user_roles_manager");
const {setAddressCoordinates} = require("../geocoder");

const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const SITE_BASE = process.env.SITE_BASE;

const createNewMenuItem = async (
  db_user,
  menu_item_details,
  menu_item_images) => {
  try{
    await db.transaction(async trx => {
      let menuItem = {
        menu_item_creator_user_id: db_user.tasttlig_user_id,
        image_url: menu_item_details.menuImage,
        title: menu_item_details.menuName,
        nationality_id: menu_item_details.menuNationality,
        start_date: new Date(menu_item_details.menuStartDate),
        end_date: new Date(menu_item_details.menuEndDate),
        start_time: new Date(menu_item_details.menuStartTime).toLocaleTimeString(),
        end_time: new Date(menu_item_details.menuEndTime).toLocaleTimeString(),
        price: menu_item_details.menuPrice,
        quantity: menu_item_details.menuQuantity,
        spice_level: menu_item_details.menuSpiceLevel,
        frequency: menu_item_details.menuFrequency,
        description: menu_item_details.menuDecription,
        address: menu_item_details.menuAddressLine1,
        city: menu_item_details.menuCity,
        state: menu_item_details.menuProvinceTerritory,
        postal_code: menu_item_details.menuPostalCode,
      };
      menuItem = await setAddressCoordinates(menuItem);
      const db_menu_item = await trx("menu_items")
        .insert(menuItem)
        .returning("*");
      const images = menu_item_images.map(menu_item_image => ({
        menu_item_id: db_menu_item[0].menu_item_id,
        image_url: menu_item_image
      }));
      await trx("menu_item_images")
        .insert(images);
    });
    return {success: true, details:"success"};
  } catch (err) {
    return {success: false, details:err.message};
  }
}

const getAllMenuItems = async (
  operator,
  status,
  keyword,
  currentPage,
  filters
) => {
  let query =  db
    .select(
      "menu_items.*",
      "tasttlig_users.phone_number",
      "tasttlig_users.email",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(menu_item_images.image_url) as image_urls")
    )
    .from("menu_items")
    .leftJoin(
      "menu_item_images",
      "menu_items.menu_item_id",
      "menu_item_images.menu_item_id"
    ).leftJoin(
      "tasttlig_users",
      "menu_items.menu_item_creator_user_id",
      "tasttlig_users.tasttlig_user_id"
    ).leftJoin(
      "nationalities",
      "experiences.nationality_id",
      "nationalities.id"
    )
    .groupBy("menu_items.menu_item_id")
    .groupBy("tasttlig_users.phone_number")
    .groupBy("tasttlig_users.email")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .having("menu_items.status", operator, status);
  
  if (filters.nationalities && filters.nationalities.length) {
    query.whereIn("nationalities.nationality", filters.nationalities);
  }
  
  if (filters.latitude && filters.longitude) {
    query.select(gis.distance("menu_items.coordinates", gis.geography(gis.makePoint(filters.longitude, filters.latitude)))
      .as("distanceAway"))
    query.where(gis.dwithin(
      "menu_items.coordinates",
      gis.geography(gis.makePoint(filters.longitude, filters.latitude)),
      filters.radius || 100000));
    query.orderBy("distanceAway", "asc");
  }
  
  if (keyword) {
    query = db
      .select("*")
      .from(
        db
          .select(
            "main.*",
            db.raw(
              "to_tsvector(main.title) " +
              "|| to_tsvector(main.description) " +
              "|| to_tsvector(main.nationality) " +
              "as search_text"
            )
          )
          .from(query.as("main"))
          .as("main")
      )
      .where(db.raw(`main.search_text @@ plainto_tsquery('${keyword}')`));
  }
  
  query = query.paginate({
    perPage: 12,
    isLengthAware: true,
    currentPage: currentPage
  });
  
  return await query
    .then(value => {
      return {success: true, details: value};
    })
    .catch(reason => {
      return {success: false, details: reason};
    });
};

module.exports = {
  createNewMenuItem,
  getAllMenuItems
}