"use strict";

const path = require("path")

module.exports = {
  

  production: {
    client: "pg",
    connection: {
      database : process.env.RDS_HOSTNAME,
      user     : process.env.RDS_USERNAME,
      password : process.env.RDS_PASSWORD,
      port     : process.env.RDS_PORT
    },
    useNullAsDefault: true
  },
};
