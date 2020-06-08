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
      database: "kodede_back_node_production"
    },
    useNullAsDefault: true
  },

  test: {
    client: "sqlite3",
    connection: ":memory:",
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, "db", "migrations")
    },
  },
};
