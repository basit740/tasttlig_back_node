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
  },
  indexSearch: async (keyword, currentPage) => {
    const arrKeyword = keyword.split(" ");
    const arr = arrKeyword.filter(item => {
      return item !== "";
    });
    console.log(arr);
    try {
      var query = db("Customer")
        .select(["FirstName", "LastName", "Country", "City", "Address"])
        .orderByRaw(
          `ts_rank(document_with_weights, to_tsquery('${arr[0]}')) desc`
        )
        .modify(queryBuilder => {
          if (arr.length > 1) {
            arr.forEach(item => {
              queryBuilder.andWhereRaw(
                `document_with_weights @@ to_tsquery('${item}:*')`
              );
            });
          } else {
            queryBuilder.whereRaw(
              `document_with_weights @@ to_tsquery('${arr[0]}:*')`
            );
          }
        })
        .returning("*")
        .paginate({
          perPage: 10,
          isLengthAware: true,
          currentPage: currentPage
        });
      const returning = await query;
      return returning;
    } catch (err) {
      if (err) {
        console.log(err);
        return err;
      }
    }
  }
};
