const environment = process.env.NODE_ENV || "development";
const configuration = require("../knexfile")[environment];
const db = require("knex")(configuration);

module.exports = {
  user: {
    getAll: () => {
      return db("users");
    },
    getUserLogin: email => {
      return db("users")
        .where("email", email)
        .first();
    },
    getUserById: id => {
      return db("users")
        .where("id", id)
        .first();
    }
  }
};
