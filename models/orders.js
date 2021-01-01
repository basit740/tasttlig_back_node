// Libraries
const { Model } = require("objection");

class Orders extends Model {
  // Table name is the only required property.
  static get tableName() {
    return "orders";
  }

  static get idColumn() {
    return "order_id";
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.
    const OrderItems = require("./order_items");
    const Payments = require("./payments");

    return {
      order_items: {
        relation: Model.HasManyRelation,
        modelClass: OrderItems,
        join: {
          from: "orders.order_id",
          to: "order_items.order_id",
        },
      },
      payments: {
        relation: Model.HasOneRelation,
        modelClass: Payments,
        join: {
          from: "orders.order_id",
          to: "payments.order_id",
        },
      },
    };
  }
}

module.exports = Orders;
