// Libraries
const { Model } = require("objection");

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

    return {
      orders: {
        relation: Model.BelongsToOneRelation,
        modelClass: Orders,
        join: {
          from: "payments.order_id",
          to: "orders.order_id",
        },
      },
    };
  }
}

module.exports = Payments;
