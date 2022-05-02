const {Model} = require("objection");

class Orders extends Model {
  static Status = Object.freeze({
    Incomplete: 'incomplete',
    Pending: 'pending',
    Paid: 'paid',
    Complete: 'complete',
    Canceled: 'canceled'
  });

  static get tableName() {
    return "orders";
  }

  static get idColumn() {
    return "order_id";
  }

  static get relationMappings() {
    const OrderItems = require("./order_items");
    const Payments = require("./payments");
    const Users = require("./users");

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
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: "orders.order_by_user_id",
          to: "tasttlig_users.tasttlig_user_id",
        },
      },
    };
  }
}

module.exports = Orders;
