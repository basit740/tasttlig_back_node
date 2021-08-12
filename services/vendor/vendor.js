"use strict";

// Libraries
const { db } = require("../../db/db-config");

const insertVendorDetails = async (
  user_details_from_db,
  vendor_information
) => {
  try {
    await db.transaction(async (trx) => {
      const db_product = await trx("vendors")
        .insert(vendor_information)
        .returning("*");

      if (!db_product) {
        return { success: false, details: "Inserting new product failed." };
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

module.exports = {
  insertVendorDetails,
};
