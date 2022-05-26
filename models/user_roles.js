const {Model} = require("objection");

module.exports = class UserRoles extends Model {
  static get tableName() {
    return "user_role_lookup";
  }

  static get idColumn() {
    return "user_role_lookup_id";
  }
};
