const {Model} = require("objection");

module.exports = class Roles extends Model {
  static Type = Object.freeze({
    Member: 'KRUP',
    Business_Member: 'BMA1',
    Guest: 'GUA1'
  });

  static get tableName() {
    return "roles";
  }

  static get idColumn() {
    return "role_id";
  }
};