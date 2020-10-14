"use strict";

const {db, gis} = require("../../db/db-config");

const getAllMenuItems = async (
  operator,
  status,
  keyword,
  currentPage,
  filters
) => {
  let query = db
    .select(
      "menu_items.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      "business_details.business_name",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(menu_item_images.image_url) as image_urls"),
    )
    .from("menu_items")
    .leftJoin(
      "menu_item_images",
      "menu_items.menu_item_id",
      "menu_item_images.menu_item_id"
    )
    .leftJoin(
      "tasttlig_users",
      "menu_items.menu_item_creator_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .leftJoin(
      "business_details",
      "menu_items.menu_item_creator_user_id",
      "business_details.user_id"
    )
    .leftJoin("nationalities",
      "menu_items.nationality_id",
      "nationalities.id"
    )
    .groupBy("menu_items.menu_item_id")
    .groupBy("tasttlig_users.first_name")
    .groupBy("tasttlig_users.last_name")
    .groupBy("business_details.business_name")
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

  if (filters.startDate) {
    query.whereRaw(
      "cast(concat(menu_items.start_date, ' ', menu_items.start_time) as date) >= ?",
      [filters.startDate]
    )
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
              "|| to_tsvector(main.first_name) " +
              "|| to_tsvector(main.last_name) " +
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
  })

  try {
    const result = await query;
    return {success: true, details: result};
  } catch (e) {
    return {success: false, details: e};
  }
}

const getDistinctNationalities = async (operator, status) => {
  return await db("menu_items")
    .where("menu_items.status", operator, status)
    .leftJoin("nationalities",
      "menu_items.nationality_id",
      "nationalities.id"
    )
    .pluck("nationalities.nationality")
    .orderBy("nationalities.nationality")
    .distinct()
    .then(value => {
      return {success: true, nationalities: value};
    })
    .catch(err => {
      return {success: false, details: err};
    });
};

module.exports = {
  getAllMenuItems,
  getDistinctNationalities
}