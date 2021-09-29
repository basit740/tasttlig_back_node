const { Model } = require("objection");

module.exports = class app extends Model {
  // Table name is the only required property.
  static get tableName() {
    return "tasttlig_app";
  }

  static get idColumn() {
    return "id";
  }
};
