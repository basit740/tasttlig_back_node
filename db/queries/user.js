// Create AJAX database environment
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../knexfile")[environment];
const db = require("knex")(configuration);

module.exports = {
  userRegister: async user => {
    const email = user.email;
    const password = user.password;
    const first_name = user.first_name;
    const last_name = user.last_name;
    const phone_number = user.phone_number;
    try {
      const returning = await db("users")
        .insert({ email, password, first_name, last_name, phone_number })
        .returning("*");
      if (returning) response = { success: true, user: returning };
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
  getUserLogin: async email => {
    try {
      const returning = await db("users")
        .where("email", email)
        .first();
      if (returning) {
        return (response = { success: true, user: returning });
      } else {
        return (response = { success: false, message: "User not found" });
      }
    } catch (err) {
      console.log(err);
      return { success: false, data: err };
    }
  },
  getUserById: async id => {
    try {
      const returning = await db("users")
        .where("id", id)
        .first();
      return (response = { success: true, user: returning });
    } catch (err) {
      return (response = { success: false, message: "No user found" });
    }
  }
};
