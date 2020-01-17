const environment = process.env.NODE_ENV || "development";
const configuration = require("../knexfile")[environment];
const db = require("knex")(configuration);

module.exports = {
  user: {
    getAll: () => {
      return db("users");
    },
    getUser: email => {
      const user = db("users")
        .where("email", email)
        .first();
      if (user.email) {
        return user;
      } else {
        return "This email does not exist";
      }
    }
  }
};
