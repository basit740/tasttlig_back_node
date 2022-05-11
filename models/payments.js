// Libraries
const {Model} = require("objection");
const Orders = require("./orders");

class Payments extends Model {
  // Table name is the only required property.
  static get tableName() {
    return "payments";
  }

  static get idColumn() {
    return "payment_id";
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    const Orders = require("./orders");
    const UserSubscriptions = require("./user_subscriptions");

    return {
      orders: {
        relation: Model.BelongsToOneRelation,
        modelClass: Orders,
        join: {
          from: "payments.order_id",
          to: "orders.order_id",
        },
      },
      user_subscription: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserSubscriptions,
        join: {
          from: "payments.user_subscription_id",
          to: "user_subscriptions.user_subscriptions_id",
        },
      },
    };
  }
}

module.exports = Payments;
