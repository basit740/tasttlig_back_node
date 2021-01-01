"use strict";

// Libraries
const { db } = require("../../db/db-config");

// Add transportation helper function
const addTransportation = async (
  db_user,
  transportation_details,
  transportation_images,
  trx
) => {
  try {
    let transportationItem = {
      creator_user_id: db_user.tasttlig_user_id,
      name: transportation_details.name,
      type: transportation_details.type,
      status: "INACTIVE",
      price: transportation_details.price,
      unit: transportation_details.unit,
      description: transportation_details.description,
    };

    const db_transportation_item = await trx("transportation")
      .insert(transportationItem)
      .returning("*");

    const images = transportation_images.map((transportation_image) => ({
      transportation_id: db_transportation_item[0].transportation_id,
      image_url: transportation_image,
    }));

    await trx("transportation_images").insert(images);

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Update transportation helper function
const updateTransportation = async (
  db_user,
  transportation_details,
  transportation_images,
  trx
) => {
  try {
    let transportationItem = {
      creator_user_id: db_user.tasttlig_user_id,
      name: transportation_details.name,
      type: transportation_details.type,
      status: transportation_details.status,
      price: transportation_details.price,
      unit: transportation_details.unit,
      description: transportation_details.description,
    };

    const db_transportation_item = await trx("transportation")
      .update(transportationItem)
      .returning("*");

    if (transportation_images && transportation_images.length > 0) {
      await trx("transportation_images")
        .where({
          transportation_id: db_transportation_item[0].transportation_id,
        })
        .del();

      const images = transportation_images.map((transportation_image) => ({
        transportation_id: db_transportation_item[0].transportation_id,
        image_url: transportation_image,
      }));

      await trx("transportation_images").insert(images);
    }

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Get user transportation details helper function
const getUserTransportationDetails = async (
  creator_user_id,
  operator,
  status,
  currentPage
) => {
  let query = db
    .select(
      "transportation.*",
      db.raw("ARRAY_AGG(transportation_images.image_url) as image_urls")
    )
    .from("transportation")
    .leftJoin(
      "transportation_images",
      "transportation.transportation_id",
      "transportation_images.transportation_id"
    )
    .groupBy("transportation.transportation_id")
    .having("transportation.status", operator, status);

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
  addTransportation,
  updateTransportation,
  getUserTransportationDetails,
};
