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
      type: assetDetails.asset_type,
      price: assetDetails.asset_price,
      description: assetDetails.description,
      contact_name: assetDetails.asset_contact,
      contact_phone: assetDetails.asset_contact_phone,
      start_time: new Date(assetDetails.asset_start_time).toLocaleTimeString(),
      end_time: new Date(assetDetails.asset_end_time).toLocaleTimeString(),
      user_id: db_user.tasttlig_user_id
    }

    if (assetDetails.asset_availability) {
      asset.availability = assetDetails.asset_availability.join(",")
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