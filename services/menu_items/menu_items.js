"use strict";

// Libraries
const { db, gis } = require("../../db/db-config");
const { setAddressCoordinates } = require("../geocoder");
const { generateRandomString } = require("../../functions/functions");
const authenticate_user_service = require("../../services/authentication/authenticate_user");

// Add menu item helper function
const addNewMenuItem = async (
  db_user,
  menu_item_details,
  menu_item_images,
  trx
) => {
  try {
    let status = "INACTIVE";
    let user_role_object = db_user.role;

    if (
      user_role_object.includes("ADMIN") ||
      user_role_object.includes("RESTAURANT")
    ) {
      status = "ACTIVE";
    }

    if (user_role_object.includes("ADMIN")) {
      let db_user_details = await authenticate_user_service.findUserByEmail(
        menu_item_details.userEmail
      );

      db_user = db_user_details.user;
    }

    let menuItem = {
      menu_item_creator_user_id: db_user.tasttlig_user_id,
      title: menu_item_details.menuName,
      nationality_id: menu_item_details.menuNationality,
      end_time: new Date(menu_item_details.menuEndTime).toLocaleTimeString(),
      menu_item_code: generateRandomString(4),
      type: menu_item_details.menuType,
      size: menu_item_details.menuSize,
      price: menu_item_details.menuPrice,
      quantity: menu_item_details.menuQuantity,
      spice_level: menu_item_details.menuSpiceLevel,
      description: menu_item_details.menuDescription,
      address: menu_item_details.menuAddressLine1,
      city: menu_item_details.menuCity,
      state: menu_item_details.menuProvinceTerritory,
      postal_code: menu_item_details.menuPostalCode,
      is_vegetarian: menu_item_details.dietaryRestrictions.includes(
        "vegetarian"
      ),
      is_vegan: menu_item_details.dietaryRestrictions.includes("vegan"),
      is_gluten_free: menu_item_details.dietaryRestrictions.includes(
        "glutenFree"
      ),
      is_halal: menu_item_details.dietaryRestrictions.includes("halal"),
      is_available_on_monday: menu_item_details.daysAvailable.includes(
        "available_on_monday"
      ),
      is_available_on_tuesday: menu_item_details.daysAvailable.includes(
        "available_on_tuesday"
      ),
      is_available_on_wednesday: menu_item_details.daysAvailable.includes(
        "available_on_wednesday"
      ),
      is_available_on_thursday: menu_item_details.daysAvailable.includes(
        "available_on_thursday"
      ),
      is_available_on_friday: menu_item_details.daysAvailable.includes(
        "available_on_friday"
      ),
      is_available_on_saturday: menu_item_details.daysAvailable.includes(
        "available_on_saturday"
      ),
      is_available_on_sunday: menu_item_details.daysAvailable.includes(
        "available_on_sunday"
      ),
      include_in_festival: menu_item_details.include_in_festival,
      samples_per_day: menu_item_details.samples_per_day,
      status: status,
    };

    menuItem = await setAddressCoordinates(menuItem);

    const db_menu_item = await trx("menu_items")
      .insert(menuItem)
      .returning("*");

    const images = menu_item_images.map((menu_item_image) => ({
      menu_item_id: db_menu_item[0].menu_item_id,
      image_url: menu_item_image,
    }));

    await trx("menu_item_images").insert(images);

    return { success: true, details: "Success." };
  } catch (error) {
    if (error.code === 23505) {
      return addNewMenuItem(db_user, menu_item_details, menu_item_images, trx);
    }

    return { success: false, details: error.message };
  }
};

// Get user menu items helper function
const getMenuItemsForUser = async (userId, keyword) => {
  let query = _getBaseMenuItemQuery().where(
    "menu_item_creator_user_id",
    userId
  );

  if (keyword) {
    query = _applyKeywordSearch(query, keyword);
  }

  try {
    const result = await query;

    return { success: true, menuItems: result };
  } catch (error) {
    return { success: false, error };
  }
};

// Get menu item helper function
const getMenuItem = async (menuItemId) => {
  const result = await _getBaseMenuItemQuery()
    .where("menu_items.menu_item_id", menuItemId)
    .first();

  return { success: true, menuItem: result };
};

// Get all menu items helper function
const getAllMenuItems = async (
  operator,
  status,
  keyword,
  currentPage,
  filters
) => {
  let query = _getBaseMenuItemQuery().having(
    "menu_items.status",
    operator,
    status
  );

  if (filters.nationalities && filters.nationalities.length) {
    query.whereIn("nationalities.nationality", filters.nationalities);
  }

  if (filters.latitude && filters.longitude) {
    query.select(
      gis
        .distance(
          "menu_items.coordinates",
          gis.geography(gis.makePoint(filters.longitude, filters.latitude))
        )
        .as("distanceAway")
    );
    query.where(
      gis.dwithin(
        "menu_items.coordinates",
        gis.geography(gis.makePoint(filters.longitude, filters.latitude)),
        filters.radius || 100000
      )
    );
    query.orderBy("distanceAway", "asc");
  }

  if (keyword) {
    query = _applyKeywordSearch(query, keyword);
  }

  query = query.paginate({
    perPage: 12,
    isLengthAware: true,
    currentPage: currentPage,
  });

  try {
    const result = await query;

    return { success: true, details: result };
  } catch (error) {
    return { success: false, details: error };
  }
};

// Get all user menu items helper function
const getAllUserMenuItems = async (
  operator,
  status,
  keyword,
  currentPage,
  user_id,
  requestByAdmin = false
) => {
  let query = _getBaseMenuItemQuery().having(
    "menu_items.status",
    operator,
    status
  );

  if (!requestByAdmin) {
    query.having("menu_item_creator_user_id", "=", user_id);
  }

  if (keyword) {
    query = _applyKeywordSearch(query, keyword);
  }

  query = query.paginate({
    perPage: 12,
    isLengthAware: true,
    currentPage: currentPage,
  });

  try {
    const result = await query;

    return { success: true, details: result };
  } catch (error) {
    return { success: false, details: error };
  }
};

// Get menu item nationalities helper function
const getDistinctNationalities = async (operator, status) => {
  return await db("menu_items")
    .where("menu_items.status", operator, status)
    .leftJoin("nationalities", "menu_items.nationality_id", "nationalities.id")
    .pluck("nationalities.nationality")
    .orderBy("nationalities.nationality")
    .distinct()
    .then((value) => {
      return { success: true, nationalities: value };
    })
    .catch((err) => {
      return { success: false, details: err };
    });
};

// Keyword search helper function
const _applyKeywordSearch = (query, keyword) => {
  return db
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
              "main.title, " +
              "main.description, " +
              "main.first_name, " +
              "main.last_name, " +
              "main.nationality" +
              ")) as search_text"
          )
        )
        .from(query.as("main"))
        .as("main")
    )
    .orderBy("rank", "desc");
};

// Menu item query helper function
const _getBaseMenuItemQuery = () => {
  return db
    .select(
      "menu_items.*",
      "tasttlig_users.phone_number",
      "tasttlig_users.email",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      "business_details.business_name",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(menu_item_images.image_url) as image_urls")
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
    .leftJoin("nationalities", "menu_items.nationality_id", "nationalities.id")
    .groupBy("menu_items.menu_item_id")
    .groupBy("tasttlig_users.first_name")
    .groupBy("tasttlig_users.last_name")
    .groupBy("tasttlig_users.phone_number")
    .groupBy("tasttlig_users.email")
    .groupBy("business_details.business_name")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code");
};

module.exports = {
  addNewMenuItem,
  getAllMenuItems,
  getDistinctNationalities,
  getMenuItemsForUser,
  getMenuItem,
  getAllUserMenuItems,
};
