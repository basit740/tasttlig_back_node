"use strict";

const {db} = require("../../db/db-config");

const addEntertainment = async (
  db_user,
  entertainment_details,
  entertainment_images,
  trx
) => {
  try{
    let entertainmentItem = {
      creator_user_id: db_user.tasttlig_user_id,
      title: entertainment_details.title,
      type: entertainment_details.type,
      status: "INACTIVE",
      nationality_id: entertainment_details.nationality_id,
      genre: entertainment_details.genre,
      media_link: entertainment_details.media_link,
      description: entertainment_details.description
    };
    
    const db_entertainment_item = await trx("entertainment")
      .insert(entertainmentItem)
      .returning("*");
    const images = entertainment_images.map(entertainment_image => ({
      entertainment_id: db_entertainment_item[0].entertainment_id,
      image_url: entertainment_image
    }));
    await trx("entertainment_images")
      .insert(images);
    return {success: true, details:"success"};
  } catch (err) {
    return {success: false, details:err.message};
  }
}

const updateEntertainment = async (
  db_user,
  entertainment_details,
  entertainment_images,
  trx
) => {
  try{
    let entertainmentItem = {
      creator_user_id: db_user.tasttlig_user_id,
      title: entertainment_details.title,
      type: entertainment_details.type,
      status: entertainment_details.status,
      nationality_id: entertainment_details.nationality_id,
      genre: entertainment_details.genre,
      media_link: entertainment_details.media_link,
      description: entertainment_details.description
    };
    const db_entertainment_item = await trx("entertainment")
      .update(entertainmentItem)
      .returning("*");
    if(entertainment_images && entertainment_images.length > 0){
      await trx("entertainment_images")
        .where({
          "entertainment_id": db_entertainment_item[0].entertainment_id
        })
        .del();
      const images = entertainment_images.map(entertainment_image => ({
        entertainment_id: db_entertainment_item[0].entertainment_id,
        image_url: entertainment_image
      }));
      await trx("entertainment_images")
        .insert(images);
    }
    return {success: true, details:"success"};
  } catch (err) {
    return {success: false, details:err.message};
  }
}

const getUserEntertainmentDetails = async (
  creator_user_id,
  operator,
  status,
  currentPage
) => {
  let query = db
    .select(
      "entertainment.*",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(entertainment_images.image_url) as image_urls"),
    )
    .from("entertainment")
    .leftJoin(
      "entertainment_images",
      "entertainment.entertainment_id",
      "entertainment_images.entertainment_id"
    )
    .leftJoin("nationalities",
      "entertainment.nationality_id",
      "nationalities.id"
    )
    .groupBy("entertainment.entertainment_id")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .having("entertainment.status", operator, status);
  
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

module.exports = {
  addEntertainment,
  updateEntertainment,
  getUserEntertainmentDetails
}