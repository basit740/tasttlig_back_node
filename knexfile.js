"use strict";

module.exports = {
  development: {
    client: "pg",
    connection: {
      database: "kodede_back_node_development"
    },
    migrations: {
      directory: "./migrations"
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
  }
};
