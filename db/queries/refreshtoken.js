// Create AJAX database environment
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../knexfile")[environment];
const db = require("knex")(configuration);

module.exports = {
  storeToken: async (refreshtoken, user_id) => {
    try {
      const response = await db("refreshtokens")
        .select()
        .where("user_id", user_id);
      if (response.length === 0) {
        try {
          await db("refreshtokens").insert({
            refreshtoken,
            user_id
          });
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          const response = await db("refreshtokens")
            .where("user_id", user_id)
            .update("refreshtoken", refreshtoken) //TODO: UPDATE THE UPDATE TIME
            .returning("*");
          console.log(response);
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      return (response = {
        success: false,
        message: err
      });
    }
  },
  checkToken: async (refreshtoken, user_id) => {
    try {
      const returning = await db("refreshtokens")
        .where("user_id", user_id)
        .where("refreshtoken", refreshtoken);
      return (response = { success: true, message: "ok", response: returning });
    } catch (err) {
      return (response = { success: false, message: err });
    }
  }
};
