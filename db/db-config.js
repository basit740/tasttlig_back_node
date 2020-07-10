const environment = process.env.NODE_ENV || "development";
const config = require("../knexfile")[environment];

console.log(environment);
console.log(config);

const db = require("knex")(config);

db.migrate.latest();

module.exports = db;
