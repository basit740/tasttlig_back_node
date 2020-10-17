"use strict";

const {db} = require("../../db/db-config");

const getUserPoints = async(user_id) => {
  return db("points_history")
    .select(db.raw("SUM(points)"))
    .where("user_id", user_id)
    .then(value => {
      return {success: true, data: value};
    })
    .catch(reason => {
      return {success: false, data: reason};
    });
}

const addUserPoints = async(user_id, points) => {
  return db("points_history")
    .insert({
      user_id: user_id,
      points: points,
      status: "ACTIVE",
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning("*")
    .then(value => {
      return {success: true, data: value};
    })
    .catch(reason => {
      return {success: false, data: reason};
    });
}

module.exports = {
  getUserPoints,
  addUserPoints
}