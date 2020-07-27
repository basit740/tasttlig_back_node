const environment = process.env.NODE_ENV;
const config = require("../knexfile")[environment];

const db = require("knex")(config);

db.migrate.latest();

module.exports = db;
