"use strict";

const {db} = require("../../db/db-config");

const deleteInactiveItems = async () => {
  try {
    await db.transaction(async trx => {
      let oldFoodSamples = trx("")
    });
  }catch (error) {
    return {success: false, details:error.message};
  }
}


module.exports = {
  deleteInactiveItems
}