"use strict";
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);
const { attachPaginate } = require("knex-paginate");
attachPaginate();

module.exports = {
  searchKeyword: async (keyword, currentPage) => {
    try {
      const returning = await db("users")
        .select(["users.first_name", "experiences.title"])
        .from("users")
        .join("experiences", { "experiences.user_id": "users.id" })
        .where("experiences.title", "ILIKE", `%${keyword}%`)
        .orWhere("users.first_name", "ILIKE", `%${keyword}%`)
        .limit(3)
        .returning("*")
        .paginate({
          perPage: 3,
          isLengthAware: true,
          currentPage: currentPage
        });
      return { success: true, message: "ok", data: returning };
    } catch (err) {
      return { success: false, message: err };
    }
  }
};
