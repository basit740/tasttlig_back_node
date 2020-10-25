"use strict";

const addAsset = async (
  db_user,
  assetDetails,
  images,
  trx
) => {
  try {
    const asset = {
      name: assetDetails.name,
      description: assetDetails.description,
      user_id: db_user.tasttlig_user_id
    }

    const a = await trx("assets").insert(asset).returning("*");
    await trx("asset_images").insert(images.map(i => ({
      image_url: i,
      asset_id: a[0].asset_id
    })));

    return {success: true}
  } catch (e) {
    return {
      success: false,
      details: e.message
    };
  }
}

module.exports = {
  addAsset
}