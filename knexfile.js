"use strict";

module.exports = {
  development: {
    client: "pg",
    connection: {
		 host : '127.0.0.1',
		 port : '5432',
      database: "kodede_back_node_development",
	  user: "postgres",
	  password: "kevin1990"
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
  }
};
