const { Model } = require("objection");

module.exports = class role extends Model {
  // Table name is the only required property.
  static get tableName() {
    return "roles";
  }

  static get idColumn() {
    return "role_id";
  }
};
