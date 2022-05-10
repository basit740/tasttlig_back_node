const {Model} = require("objection");

class Subscriptions extends Model {
  static get tableName() {
    return "subscriptions";
  }

  static get idColumn() {
    return "subscription_id";
  }
}

module.exports = Subscriptions;