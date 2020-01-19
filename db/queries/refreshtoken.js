const environment = process.env.NODE_ENV || "development";
const configuration = require("../../knexfile")[environment];
const db = require("knex")(configuration);

module.exports = {
  storeToken: async (refreshtoken, user_id) => {
    try {
      const returning = await db("refreshtokens")
        .insert({ refreshtoken, user_id })
        .returning("*");
      return (response = {
        success: true,
        message: "Refresh token stored",
        refreshtoken: returning
      });
    } catch (err) {
      return (response = { success: false, message: err });
    }
  }
};
