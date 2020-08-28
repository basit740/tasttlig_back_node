const environment = process.env.NODE_ENV;
const config = require("../knexfile")[environment];

const db = require("knex")(config);
const { attachPaginate } = require('knex-paginate');
attachPaginate();

db.migrate.latest();

module.exports = db;
