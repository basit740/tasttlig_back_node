"use strict";

// Libraries
const { db } = require("../../db/db-config");
const { setAddressCoordinates } = require("../geocoder");

// Add venue helper function
const addVenue = async (db_user, venue_details, venue_images, trx) => {
  try {
    let venueItem = {
      creator_user_id: db_user.tasttlig_user_id,
      name: venue_details.name,
      type: venue_details.type,
      price: venue_details.price,
      capacity: venue_details.capacity,
      status: "INACTIVE",
      unit: venue_details.unit,
      description: venue_details.description,
      address: venue_details.address,
      city: venue_details.city,
      state: venue_details.state,
      postal_code: venue_details.postal_code,
    };

    venueItem = await setAddressCoordinates(venueItem);

    const db_venueItem = await trx("venue").insert(venueItem).returning("*");

    const images = venue_images.map((venue_image) => ({
      venue_id: db_venueItem[0].venue_id,
      image_url: venue_image,
    }));

    await trx("venue_images").insert(images);

    return { success: true, details: "Success." };
  } catch (error) {
    if (error.code === 23505) {
      return addNewMenuItem(db_user, menu_item_details, menu_item_images, trx);
    }

    return { success: false, details: error.message };
  }
};

// Update venue helper function
const updateVenue = async (db_user, venue_details, venue_images, trx) => {
  try {
    let venueItem = {
      creator_user_id: db_user.tasttlig_user_id,
      name: venue_details.name,
      type: venue_details.type,
      price: venue_details.price,
      capacity: venue_details.capacity,
      status: venue_details.status,
      unit: venue_details.unit,
      description: venue_details.description,
      address: venue_details.address,
      city: venue_details.city,
      state: venue_details.state,
      postal_code: venue_details.postal_code,
    };

    venueItem = await setAddressCoordinates(venueItem);

    const db_venue_item = await trx("venue").update(venueItem).returning("*");

    if (venue_images && venue_images.length > 0) {
      await trx("venue_images")
        .where({
          venue_id: db_venue_item[0].venue_id,
        })
        .del();

      const images = venue_images.map((venue_image) => ({
        venue_id: db_venue_item[0].venue_id,
        image_url: venue_image,
      }));

      await trx("venue_images").insert(images);
    }

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Get user venue details helper function
const getUserVenueDetails = async (
  creator_user_id,
  operator,
  status,
  currentPage
) => {
  let query = db
    .select(
      "venue.*",
      db.raw("ARRAY_AGG(venue_images.image_url) as image_urls")
    )
    .from("venue")
    .leftJoin("venue_images", "venue.venue_id", "venue_images.venue_id")
    .groupBy("venue.venue_id")
    .having("venue.status", operator, status);

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

module.exports = {
  addVenue,
  updateVenue,
  getUserVenueDetails,
};
