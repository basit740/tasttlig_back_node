"use strict";

const path = require("path")

module.exports = {
  development: {
    client: "pg",
    connection: {
      database: "kodede_back_node_development"
    },
    migrations: {
      directory: "./db/migrations"
    },
    useNullAsDefault: true
  },

  staging: {
    client: "pg",
    connection: {
      database: "kodede_back_node_staging"
    },
    useNullAsDefault: true
  },

  production: {
    client: "pg",
    connection: {
      host : process.env.RDS_HOSTNAME,
      database: process.env.RDS_DB_NAME,
      user     : process.env.RDS_USERNAME,
      password : process.env.RDS_PASSWORD,
      port     : process.env.RDS_PORT
    },
    migrations: {
      directory: "./db/migrations"
    },
    useNullAsDefault: true
  },

  test: {
    client: "sqlite3",
    connection: ":memory:",
    useNullAsDefault: true,
    migrations: {
      directory: "./db/migrations"
    },
  },
};
