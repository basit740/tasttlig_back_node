"use strict";

const db = require("../../db/db-config");

const getUserById = async id => {
  return await db("tasttlig_users")
      .where("tasttlig_user_id", id)
      .first()
      .then(value => {
        if (!value){
          return { success: false, message: "No user found." };
        }
        return { success: true, user: value };
      }).catch(error => {
        return { success: false, message: error };
      });
}

module.exports = {
  getUserById
}