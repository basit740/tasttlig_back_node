const environment = process.env.NODE_ENV || "development";
const config = require("../knexfile")[environment];

const db = require("knex")(config);

db.migrate.latest()

module.exports = db;