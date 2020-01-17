const knex = require("./knexfile");

module.exports = {
  user: {
    getAll: () => {
      return knex("user");
    },
    getOne: id => {
      return knex(user)
        .where("id", id)
        .first();
    }
  }
};
